/* eslint-disable callback-return */
/* eslint-disable max-len */
/* eslint-disable import/no-unassigned-import */
import React from "react";
import { renderHook } from "@testing-library/react";
import "cross-fetch/polyfill";
import "./__mocks__/mock-global";
import { setupServer } from "msw/node";
import { useTelemetryDeck } from "../use-telemetrydeck";
import { TelemetryDeckProvider } from "../telemetrydeck-provider";
import { createTelemetryDeck, TelemetryDeckReactSDKPlugin } from "../create-telemetrydeck";
import { LIB_VERSION } from "../version";
import { handlers } from "./test-utils/handlers";
import { appID } from "./test-utils/variables";
import stringifyObjectValues from "./test-utils/transform";

const server = setupServer(...handlers);

const getSignalPayload = () => {
  let signalPayload: Record<string, unknown> | undefined;
  server.events.on("request:start", (request) => {
    const { body } = request;
    if (Array.isArray(body) && body.length > 0) {
      const [{ payload }] = body;
      signalPayload = payload;
    } else if (body) {
      const { payload } = body as { payload: Record<string, unknown> };
      signalPayload = payload;
    }
  });
  return () => signalPayload;
};

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test("Given no plugins are added, when sending a signal, it resolves to the default payload", async () => {
  const td = createTelemetryDeck({ appID, clientUser: "anonymous" });
  const readPayload = getSignalPayload();

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <TelemetryDeckProvider telemetryDeck={td}>{children}</TelemetryDeckProvider>
  );
  const { result: { current: { signal } } } = renderHook(() => useTelemetryDeck(), { wrapper: Wrapper });
  await signal("signal button click");

  expect(readPayload()).toEqual({ tdReactVersion: LIB_VERSION });
});

test("Given an empty plugin array, when sending a signal, it resolves to the default payload", async () => {
  const td = createTelemetryDeck({ appID, clientUser: "anonymous", plugins: [] });
  const readPayload = getSignalPayload();

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <TelemetryDeckProvider telemetryDeck={td}>{children}</TelemetryDeckProvider>
  );
  const { result: { current: { signal } } } = renderHook(() => useTelemetryDeck(), { wrapper: Wrapper });
  await signal("signal button click");

  expect(readPayload()).toEqual({ tdReactVersion: LIB_VERSION });
});

test("Given a valid plugin decorator, when sending a signal, its payload is added", async () => {
  const pluginPayload = { pluginValue: "valid plugin value" };

  const validPluginDecorator: TelemetryDeckReactSDKPlugin = (next) => (payload) => {
    const enhancedPayload = next(payload);
    return { ...enhancedPayload, ...pluginPayload };
  };

  const td = createTelemetryDeck({ appID, clientUser: "anonymous", plugins: [validPluginDecorator] });
  const readPayload = getSignalPayload();

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <TelemetryDeckProvider telemetryDeck={td}>{children}</TelemetryDeckProvider>
  );
  const { result: { current: { signal } } } = renderHook(() => useTelemetryDeck(), { wrapper: Wrapper });
  await signal("signal button click");

  const expectedPayload = { tdReactVersion: LIB_VERSION, ...pluginPayload };
  expect(readPayload()).toEqual(expectedPayload);
});

test("Given multiple valid plugin decorators, when sending a signal, all payloads are added", async () => {
  const plugin1Payload = { plugin1Value: "value 1" };
  const plugin2Payload = { plugin2Value: 12345, plugin1Value: "overwritten value" };

  const plugin1: TelemetryDeckReactSDKPlugin = (next) => (payload) => {
    const enhancedPayload = next(payload);
    return { ...enhancedPayload, ...plugin1Payload };
  };

  const plugin2: TelemetryDeckReactSDKPlugin = (next) => (payload) => {
    const enhancedPayload = next(payload);
    return { ...enhancedPayload, ...plugin2Payload };
  };

  const td = createTelemetryDeck({ appID, clientUser: "anonymous", plugins: [plugin1, plugin2] });
  const readPayload = getSignalPayload();

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <TelemetryDeckProvider telemetryDeck={td}>{children}</TelemetryDeckProvider>
  );
  const { result: { current: { signal } } } = renderHook(() => useTelemetryDeck(), { wrapper: Wrapper });
  await signal("signal button click");

  const expectedPayload = {
    tdReactVersion: LIB_VERSION,
    ...plugin1Payload,
    ...plugin2Payload,
  };
  expect(readPayload()).toEqual(stringifyObjectValues(expectedPayload));
});

