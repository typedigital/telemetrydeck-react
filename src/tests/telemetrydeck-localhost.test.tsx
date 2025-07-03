/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable max-len */
import { createTelemetryDeck } from "../create-telemetrydeck";
import { appID } from "./test-utils/variables";

let windowSpy: any;

beforeEach(() => {
  windowSpy = jest.spyOn(window, "window", "get");
});
afterEach(() => {
  windowSpy!.mockRestore();
});

test("Given the telemetryDeck was initilized, when the environment is a localhost, then telemetryDeck should be in testMode", () => {
  const td = createTelemetryDeck({ appID, clientUser: "anonymous" });
  expect(td.testMode).toBeTruthy();
});
test("Given the telemetryDeck was initilized, when the environment is not a production, then telemetryDeck should not be in testMode", () => {
  windowSpy.mockImplementation(() => ({
    location: {
      hostname: "https://example.com",
    },
  }));
  const td = createTelemetryDeck({ appID, clientUser: "anonymous" });
  expect(td.testMode).toBeFalsy();
});
