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
import { LIB_VERSION } from "../version";
import browserPlugin from "../plugins/browser-plugin";
import { handlers } from "./test-utils/handlers";
import { appID } from "./test-utils/variables";
import stringifyObjectValues from "./test-utils/transform";

const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test("Given no plugins are added to TelemetryDeck context, when sending a signal, it resolves to the default payload", async () => {
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

  expect(JSON.stringify(signalPayload)).toBe(JSON.stringify({ tdReactVersion: LIB_VERSION }));
});

test("Given a telemetryDeck with an empty plugin array, when sending a signal, it resolves to the default payload", async () => {
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

  expect(JSON.stringify(signalPayload)).toBe(JSON.stringify({ tdReactVersion: LIB_VERSION }));
});

test("Given a telemetryDeck with a valid plugin, when sending a signal, the respective plugins payload was added to the signal", async () => {
  const pluginPayload = { pluginValue: "valid plugin value" };
  const validPlugin = {
    name: "Valid Plugin",
    getPluginPayload: () => pluginPayload,
  };
  const td = createTelemetryDeck({ appID, clientUser: "anonymous", plugins: [validPlugin] });

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

  expect(JSON.stringify(signalPayload)).toBe(JSON.stringify({ tdReactVersion: LIB_VERSION, ...pluginPayload }));
});

test("Given a telemetryDeck with multiple valid plugins, when sending a signal, the respective plugins payloads were added to the signal", async () => {
  const pluginPayloads: Record<string, unknown> = {
    plugin1Value: "valid plugin value", plugin2Value: 15029, plugin3Value: true,
  };

  const validPlugins = Object.entries(pluginPayloads).map(([key, value]) => {
    const pluginPayload: Record<string, unknown> = {};
    pluginPayload[key] = value;
    return { name: "Valid Plugin", getPluginPayload: () => pluginPayload };
  });
  const td = createTelemetryDeck({ appID, clientUser: "anonymous", plugins: validPlugins });

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

  expect(JSON.stringify(signalPayload)).toBe(JSON.stringify({ tdReactVersion: LIB_VERSION, ...(stringifyObjectValues(pluginPayloads)) }));
});

test("Given a telemetryDeck, when adding an invalid plugin, it throws an error", () => {
  const invalidPlugin = () => "invalidPlugin";
  let error;
  try {
    createTelemetryDeck({
      // @ts-expect-error since we are testing an edge case where users using javaScript might pass invalid plugin configurations
      appID, clientUser: "anonymous", plugins: [invalidPlugin],
    });
  } catch (err) {
    error = err;
  }
  expect(error).toBeDefined();
});

test("Given a telemetryDeck, when adding valid and invalid plugins, it throws an error", () => {
  const invalidPlugin = () => "invalidPlugin";
  let error;
  try {
    createTelemetryDeck({
      // @ts-expect-error since we are testing an edge case where users using javaScript might pass invalid plugin configurations
      appID, clientUser: "anonymous", plugins: [browserPlugin, invalidPlugin],
    });
  } catch (err) {
    error = err;
  }
  expect(error).toBeDefined();
});
