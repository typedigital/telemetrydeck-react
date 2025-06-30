/* eslint-disable max-len */
/* eslint-disable import/no-unassigned-import */

import React from "react";
import { renderHook } from "@testing-library/react";
import "cross-fetch/polyfill";
import "./__mocks__/mock-global";
import { setupServer } from "msw/node";
import { useTelemetryDeck } from "../use-telemetrydeck";
import { TelemetryDeckProvider } from "../telemetrydeck-provider";
import { createTelemetryDeck } from "../create-telemetrydeck";
import { browserPlugin } from "../plugins";
import { handlers } from "./test-utils/handlers";
import { appID } from "./test-utils/variables";

const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test("Given the browser plugin is not added to TelemetryDeck context, when sending a signal, then the result contains no browser plugin payload", async () => {
  const td = createTelemetryDeck({ appID, clientUser: "anonymous" });
  let signalPayload = {};
  server.events.on("request:start", (request) => {
    const { body } = request;
    if (Array.isArray(body) && body.length > 0) {
      const [{ payload }] = body;
      signalPayload = payload;
    } else {
      const { payload } = body as { payload: Record<string, unknown> };
      signalPayload = payload;
    }
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <TelemetryDeckProvider telemetryDeck={td}>
      {children}
    </TelemetryDeckProvider>
  );
  const { result: { current: { signal } } } = renderHook(() => useTelemetryDeck(), { wrapper: Wrapper });
  await signal("signal button click");

  expect(signalPayload).not.toHaveProperty("renderingEngine");
  expect(signalPayload).not.toHaveProperty("os");
  expect(signalPayload).not.toHaveProperty("deviceType");
});

test("Given a telemetryDeck including the browserPlugin, when sending a signal, then the browserPlugin information is included in the signal payload", async () => {
  const td = createTelemetryDeck({ appID, clientUser: "anonymous", plugins: [browserPlugin] });

  let signalPayload = {};
  server.events.on("request:start", (request) => {
    const { body } = request;
    if (Array.isArray(body) && body.length > 0) {
      const [{ payload }] = body;
      signalPayload = payload;
    } else {
      const { payload } = body as { payload: Record<string, unknown> };
      signalPayload = payload;
    }
  });

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <TelemetryDeckProvider telemetryDeck={td}>
      {children}
    </TelemetryDeckProvider>
  );

  const { result: { current: { signal } } } = renderHook(() => useTelemetryDeck(), { wrapper: Wrapper });
  await signal("signal button click");

  expect(signalPayload).toHaveProperty("renderingEngine");
  expect(signalPayload).toHaveProperty("os");
  expect(signalPayload).toHaveProperty("deviceType");
});

/**
  * This array of test cases was selected to ensure robust browser detection across both standard and complex scenarios.
  * The user agent strings are based on common, modern examples like those listed on DeviceAtlas (https://deviceatlas.com/blog/list-of-user-agent-strings)
  * and are chosen for two primary reasons:
  *
  * 1. **Standard Coverage:** To confirm that major, distinct browsers are correctly identified.
  *    - "Firefox on Windows" and "Safari on macOS" represent straightforward test cases.
  *    - "Safari on iPhone" is included to ensure the detection logic works on mobile platforms, not just desktop.
  *
  * 2. **Edge Case and Order Validation:** To handle the historical complexity of user agent strings where one browser includes identifiers from another.
  *    - "Edge on Windows" and "Opera on Windows" are critical because their user agents also contain "Chrome" and "Safari". These tests verify
  *      that the parsing logic correctly checks for "Edg/" and "OPR/" *before* falling back to the more general "Chrome" check.
  *    - "Standard Chrome on Windows" is also an edge case because it contains "Safari". This test ensures "Chrome" is detected before "Safari".
*/
const testCases = [
  {
    name: "Firefox on Windows",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/115.0",
    expected: { browserName: "Firefox", browserVersion: "115.0" },
  },
  {
    name: "Safari on macOS",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5.1 Safari/605.1.15",
    expected: { browserName: "Safari", browserVersion: "16.5.1" },
  },
  {
    name: "Standard Chrome on Windows",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
    expected: { browserName: "Chrome", browserVersion: "114.0.0.0" },
  },
  {
    name: "Edge on Windows",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36 Edg/114.0.1823.82",
    expected: { browserName: "Edge", browserVersion: "114.0.1823.82" },
  },
  {
    name: "Opera on Windows",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36 OPR/100.0.0.0",
    expected: { browserName: "Opera", browserVersion: "100.0.0.0" },
  },
  {
    name: "Safari on iPhone",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/605.1.15",
    expected: { browserName: "Safari", browserVersion: "16.5" },
  },
];
test.each(testCases)("$name", async (testCase) => {
  Object.defineProperty(window.navigator, "userAgent", {
    value: testCase.userAgent,
    writable: true,
  });

  const td = createTelemetryDeck({ appID, clientUser: "anonymous", plugins: [browserPlugin] });

  let signalPayload: Record<string, unknown> = {};
  server.events.on("request:start", (request) => {
    const { body } = request;
    if (Array.isArray(body) && body.length > 0) {
      const [{ payload }] = body;
      signalPayload = payload;
    } else {
      signalPayload = (body as { payload: Record<string, unknown> }).payload;
    }
  });

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <TelemetryDeckProvider telemetryDeck={td}>
      {children}
    </TelemetryDeckProvider>
  );

  const { result: { current: { signal } } } = renderHook(
    () => useTelemetryDeck(), { wrapper: Wrapper },
  );

  await signal("signal button click");

  expect(signalPayload.browserName).toBe(testCase.expected.browserName);
  expect(signalPayload.browserVersion).toBe(testCase.expected.browserVersion);

  server.events.removeAllListeners("request:start");
});
