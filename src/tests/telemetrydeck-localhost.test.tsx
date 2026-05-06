/* eslint-disable import/no-unassigned-import */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-underscore-dangle */
/* eslint-disable max-len */
import { setupServer } from "msw/lib/node";
import { renderHook } from "@testing-library/react";
import React from "react";
import { TelemetryDeckProvider } from "../telemetrydeck-provider";
import { useTelemetryDeck } from "../use-telemetrydeck";
import { createTelemetryDeck } from "../create-telemetrydeck";
import { handlers } from "./test-utils/handlers";
import { appID, namespace } from "./test-utils/variables";
import "./__mocks__/mock-global";
import "cross-fetch/polyfill";

describe("localhost Signal an die API", () => {
  const server = setupServer(...handlers);
  const originalLocation = window.location;

  const mockLocation = (hostname: string) => {
    Object.defineProperty(window, "location", {
      writable: true,
      value: {
        ...originalLocation,
        hostname,
      },
    });
  };

  beforeAll(() => server.listen());
  beforeEach(() => {
    delete (window as any).location;
    // Reset __DEV__ to undefined before each test
    (globalThis as any).__DEV__ = undefined;
  });
  afterEach(() => {
    Object.defineProperty(window, "location", {
      writable: true,
      value: originalLocation,
    });
    (globalThis as any).__DEV__ = undefined;
    server.resetHandlers();
  });
  afterAll(() => server.close());

  test("Given the telemetryDeck was initilized, when the environment is not a localhost, then telemetryDeck should not be in testMode", () => {
    mockLocation("example.host");
    const td = createTelemetryDeck({ appID, clientUser: "anonymous", namespace });
    expect(td.testMode).toBeFalsy();
  });
  test("Given the telemetryDeck was initilized, when the environment is a localhost, then telemetryDeck should be in testMode", () => {
    mockLocation("localhost");
    const td = createTelemetryDeck({ appID, clientUser: "anonymous", namespace });
    expect(td.testMode).toBeTruthy();
  });
  test("Given the telemetryDeck was initilized with testMode set true, when the environment is not a localhost, then telemetryDeck should be in testMode", () => {
    mockLocation("example.host");
    const td = createTelemetryDeck({ appID, clientUser: "anonymous", namespace, testMode: true });
    expect(td.testMode).toBeTruthy();
  });
  test("Given the telemetryDeck was initilized with testMode set false, when the environment is a localhost, then telemetryDeck should not be in testMode", () => {
    mockLocation("localhost");
    const td = createTelemetryDeck({ appID, clientUser: "anonymous", namespace, testMode: false });
    expect(td.testMode).toBeFalsy();
  });

  it("Given the telemetryDeck was initialized on production, when sending a signal, then the signal request body should include isTestMode to be true", async () => {
    mockLocation("example.host");
    const td = createTelemetryDeck({
      appID,
      clientUser: "anonymous-tester",
      namespace,
    });

    let isTestmode = false;
    server.events.on("request:start", (request) => {
      const { body } = request;
      if (Array.isArray(body) && body.length > 0) {
        const [{ isTestMode }] = body;
        isTestmode = isTestMode;
      } else {
        const { isTestMode } = body as { isTestMode: boolean };
        isTestmode = isTestMode;
      }
    });

    const Wrapper = ({ children }: { children: React.ReactNode }) => (
      <TelemetryDeckProvider telemetryDeck={td}>
        {children}
      </TelemetryDeckProvider>
    );

    const { result: { current: { signal } } } = renderHook(() => useTelemetryDeck(), { wrapper: Wrapper });
    await signal("signal button click");

    expect(isTestmode).toBeFalsy();
  });
  it("Given the telemetryDeck was initialized on localhost, when sending a signal, then the signal request body should include isTestMode to be false", async () => {
    mockLocation("localhost");
    const td = createTelemetryDeck({
      appID,
      clientUser: "anonymous-tester",
      namespace,
    });

    let isTestmode = false;
    server.events.on("request:start", (request) => {
      const { body } = request;
      if (Array.isArray(body) && body.length > 0) {
        const [{ isTestMode }] = body;
        isTestmode = isTestMode;
      } else {
        const { isTestMode } = body as { isTestMode: boolean };
        isTestmode = isTestMode;
      }
    });

    const Wrapper = ({ children }: { children: React.ReactNode }) => (
      <TelemetryDeckProvider telemetryDeck={td}>
        {children}
      </TelemetryDeckProvider>
    );

    const { result: { current: { signal } } } = renderHook(() => useTelemetryDeck(), { wrapper: Wrapper });
    await signal("signal button click");

    expect(isTestmode).toBeTruthy();
  });

  test("Given window.location is undefined (React Native), when initializing without __DEV__, then telemetryDeck should not crash and testMode should be falsy", () => {
    // window exists but location is undefined (React Native environment)
    Object.defineProperty(window, "location", {
      writable: true,
      value: undefined,
    });
    const td = createTelemetryDeck({ appID, clientUser: "anonymous", namespace });
    expect(td.testMode).toBeFalsy();
  });

  test("Given __DEV__ is true (React Native dev mode), when initializing, then telemetryDeck should be in testMode", () => {
    (globalThis as any).__DEV__ = true;
    Object.defineProperty(window, "location", {
      writable: true,
      value: undefined,
    });
    const td = createTelemetryDeck({ appID, clientUser: "anonymous", namespace });
    expect(td.testMode).toBeTruthy();
  });

  test("Given __DEV__ is true, when testMode is explicitly set to false, then telemetryDeck should not be in testMode", () => {
    (globalThis as any).__DEV__ = true;
    Object.defineProperty(window, "location", {
      writable: true,
      value: undefined,
    });
    const td = createTelemetryDeck({ appID, clientUser: "anonymous", namespace, testMode: false });
    expect(td.testMode).toBeFalsy();
  });
});
