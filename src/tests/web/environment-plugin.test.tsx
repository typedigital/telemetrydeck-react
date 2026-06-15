/* eslint-disable max-len */
/* eslint-disable import/no-unassigned-import */
import React from "react";
import { renderHook } from "@testing-library/react";
import "cross-fetch/polyfill";
import "../__mocks__/mock-global";
import { setupServer } from "msw/node";
import { useTelemetryDeck } from "../../use-telemetrydeck";
import { TelemetryDeckProvider } from "../../telemetrydeck-provider";
import { createTelemetryDeck } from "../../create-telemetrydeck";
import { LIB_VERSION } from "../../version";
import { webEnvironmentPlugin } from "../../plugins/web-environment-plugin";
import { handlers } from "../test-utils/handlers";
import { appID, namespace } from "../test-utils/variables";

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

test("Environment plugin adds SDK info to payload", async () => {
  const td = createTelemetryDeck({
    appID,
    clientUser: "anonymous",
    namespace,
    plugins: [webEnvironmentPlugin],
  });
  const readPayload = getSignalPayload();

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <TelemetryDeckProvider telemetryDeck={td}>{children}</TelemetryDeckProvider>
  );
  const { result: { current: { signal } } } = renderHook(() => useTelemetryDeck(), { wrapper: Wrapper });
  await signal("test event");

  const payload = readPayload();
  expect(payload).toBeDefined();
  expect(payload?.["TelemetryDeck.SDK.name"]).toBe("TelemetryDeck React SDK");
  expect(payload?.["TelemetryDeck.SDK.version"]).toBe(LIB_VERSION);
  expect(payload?.["TelemetryDeck.SDK.nameAndVersion"]).toBe(`TelemetryDeck React SDK ${LIB_VERSION}`);
});

test("Environment plugin adds screen resolution", async () => {
  const td = createTelemetryDeck({
    appID,
    clientUser: "anonymous",
    namespace,
    plugins: [webEnvironmentPlugin],
  });
  const readPayload = getSignalPayload();

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <TelemetryDeckProvider telemetryDeck={td}>{children}</TelemetryDeckProvider>
  );
  const { result: { current: { signal } } } = renderHook(() => useTelemetryDeck(), { wrapper: Wrapper });
  await signal("test event");

  const payload = readPayload();
  expect(payload?.["TelemetryDeck.Device.screenResolutionWidth"]).toBeDefined();
  expect(payload?.["TelemetryDeck.Device.screenResolutionHeight"]).toBeDefined();
  expect(payload?.["TelemetryDeck.Device.screenScaleFactor"]).toBeDefined();
});

test("Environment plugin adds language info", async () => {
  const td = createTelemetryDeck({
    appID,
    clientUser: "anonymous",
    namespace,
    plugins: [webEnvironmentPlugin],
  });
  const readPayload = getSignalPayload();

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <TelemetryDeckProvider telemetryDeck={td}>{children}</TelemetryDeckProvider>
  );
  const { result: { current: { signal } } } = renderHook(() => useTelemetryDeck(), { wrapper: Wrapper });
  await signal("test event");

  const payload = readPayload();
  expect(payload?.["TelemetryDeck.RunContext.language"]).toBeDefined();
  expect(payload?.["TelemetryDeck.RunContext.locale"]).toBeDefined();
});
