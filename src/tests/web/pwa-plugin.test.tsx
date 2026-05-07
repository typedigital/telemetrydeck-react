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
import { webPwaPlugin } from "../../plugins/web-pwa-plugin";
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

test("PWA plugin adds isPWA field to payload", async () => {
  const td = createTelemetryDeck({
    appID,
    clientUser: "anonymous",
    namespace,
    plugins: [webPwaPlugin],
  });
  const readPayload = getSignalPayload();

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <TelemetryDeckProvider telemetryDeck={td}>{children}</TelemetryDeckProvider>
  );
  const { result: { current: { signal } } } = renderHook(() => useTelemetryDeck(), { wrapper: Wrapper });
  await signal("test event");

  const payload = readPayload();
  expect(payload).toBeDefined();
  expect(payload?.["TelemetryDeck.Acquisition.isPWA"]).toBe("false");
});
