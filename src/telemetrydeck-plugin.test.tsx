/* eslint-disable import/no-unassigned-import */
import React from "react";
import { renderHook } from "@testing-library/react";
import "cross-fetch/polyfill";
import "./__mocks__/mock-global";
import { setupServer } from "msw/node";
import { handlers } from "./test-utils/handlers";
import { useTelemetryDeck } from "./use-telemetrydeck";
import { TelemetryDeckProvider } from "./telemetrydeck-provider";
import { createTelemetryDeck, TelemetryDeckReactSDKPlugins } from "./create-telemetrydeck";
import { appID } from "./test-utils/variables";

const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test("resolves the browserPlugin information when added to TelemetryDeck context", async () => {
  const td = createTelemetryDeck({ appID, clientUser: "anonymous", plugins: ["browserPlugin"] });

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
  expect(signalPayload).toHaveProperty("browserName");
  expect(signalPayload).toHaveProperty("browserVersion");
  expect(signalPayload).toHaveProperty("os");
  expect(signalPayload).toHaveProperty("deviceType");
});

test("resolves the default payload when no plugins are added to TelemetryDeck context", async () => {
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
  expect(signalPayload).not.toHaveProperty("browserName");
  expect(signalPayload).not.toHaveProperty("browserVersion");
  expect(signalPayload).not.toHaveProperty("os");
  expect(signalPayload).not.toHaveProperty("deviceType");
  expect(signalPayload).toHaveProperty("tdReactVersion");
});

test("resolves the default payload when empty plugin array is added to TelemetryDeck context", async () => {
  const td = createTelemetryDeck({ appID, clientUser: "anonymous", plugins: [] });
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
  expect(signalPayload).not.toHaveProperty("browserName");
  expect(signalPayload).not.toHaveProperty("browserVersion");
  expect(signalPayload).not.toHaveProperty("os");
  expect(signalPayload).not.toHaveProperty("deviceType");
  expect(signalPayload).toHaveProperty("tdReactVersion");
});
test("resolves the default payload when invalid plugin references are added to TelemetryDeck context", async () => {
  const td = createTelemetryDeck({
    appID, clientUser: "anonymous", plugins: ["invalidPlugin" as TelemetryDeckReactSDKPlugins],
  });
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
  expect(signalPayload).not.toHaveProperty("browserName");
  expect(signalPayload).not.toHaveProperty("browserVersion");
  expect(signalPayload).not.toHaveProperty("os");
  expect(signalPayload).not.toHaveProperty("deviceType");
  expect(signalPayload).toHaveProperty("tdReactVersion");
});

test("resolves valid plugins and handles invalid plugins gracefully if added to TelemetryDeck context", async () => {
  const td = createTelemetryDeck({
    appID, clientUser: "anonymous", plugins: ["browserPlugin", "invalidPlugin" as TelemetryDeckReactSDKPlugins],
  });
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
  expect(signalPayload).toHaveProperty("browserName");
  expect(signalPayload).toHaveProperty("browserVersion");
  expect(signalPayload).toHaveProperty("os");
  expect(signalPayload).toHaveProperty("deviceType");
  expect(async () => signal("signal button click")).not.toThrow();
});
