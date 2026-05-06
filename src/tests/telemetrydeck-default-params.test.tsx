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
import { handlers } from "./test-utils/handlers";
import { appID, namespace } from "./test-utils/variables";
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

test("Given defaultParameters, when sending a signal, they appear in the payload", async () => {
  const defaultParameters = { appVersion: "1.2.3", environment: "production" };
  const td = createTelemetryDeck({ appID, clientUser: "anonymous", namespace, defaultParameters });
  const readPayload = getSignalPayload();

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <TelemetryDeckProvider telemetryDeck={td}>{children}</TelemetryDeckProvider>
  );
  const { result: { current: { signal } } } = renderHook(() => useTelemetryDeck(), { wrapper: Wrapper });
  await signal("test event");

  expect(readPayload()).toEqual(stringifyObjectValues({
    tdReactVersion: LIB_VERSION,
    appVersion: "1.2.3",
    environment: "production",
  }));
});

test("Given defaultParameters, signal-level payload overrides them", async () => {
  const defaultParameters = { appVersion: "1.2.3", environment: "production" };
  const td = createTelemetryDeck({ appID, clientUser: "anonymous", namespace, defaultParameters });
  const readPayload = getSignalPayload();

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <TelemetryDeckProvider telemetryDeck={td}>{children}</TelemetryDeckProvider>
  );
  const { result: { current: { signal } } } = renderHook(() => useTelemetryDeck(), { wrapper: Wrapper });
  await signal("test event", { environment: "staging" });

  expect(readPayload()).toEqual(stringifyObjectValues({
    tdReactVersion: LIB_VERSION,
    appVersion: "1.2.3",
    environment: "staging",
  }));
});

test("Given no defaultParameters, signal works as before", async () => {
  const td = createTelemetryDeck({ appID, clientUser: "anonymous", namespace });
  const readPayload = getSignalPayload();

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <TelemetryDeckProvider telemetryDeck={td}>{children}</TelemetryDeckProvider>
  );
  const { result: { current: { signal } } } = renderHook(() => useTelemetryDeck(), { wrapper: Wrapper });
  await signal("test event");

  expect(readPayload()).toEqual({ tdReactVersion: LIB_VERSION });
});
