import React from "react";
import { render } from "@testing-library/react";
import { TelemetryDeckProvider, createTelemetryDeck } from ".";

let consoleErrorSpy: jest.SpyInstance;
describe("TelemetryDeckProvider", () => {
  beforeAll(() => {
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => null);
  });
  afterAll(() => {
    jest.restoreAllMocks();
  });
  it("renders without crashing for React 16 to 17", () => {
    const td = createTelemetryDeck({ appID: "my-app-id", clientUser: "" });
    render(<TelemetryDeckProvider telemetryDeck={td} />);
  });
  it("creates TelemetryDeck instance with appID", () => {
    const td = createTelemetryDeck({ appID: "my-app-id", clientUser: "" });
    expect(td).toBeInstanceOf(Object);
    expect(td.appID).toBe("my-app-id");
  });
  it("does not throw if no app id was provided", () => {
    let error;
    try {
      createTelemetryDeck({ appID: undefined, clientUser: "" });
    } catch (e) {
      error = e;
    }
    expect(error).toBeUndefined();
  });
  it("loggs an error if no app id was provided", () => {
    createTelemetryDeck({ appID: undefined, clientUser: "" });
    expect(consoleErrorSpy).toHaveBeenCalledWith("TelemetryDeck: appID is required");
  });
});
