import React from "react";
import { render } from "@testing-library/react";
import { TelemetryDeckProvider, createTelemetryDeck } from "..";

describe("TelemetryDeckProvider", () => {
  test("Given a telemetryDeck under React 16 or 17, when rendering, the implementation does not crash", () => {
    const td = createTelemetryDeck({ appID: "my-app-id", clientUser: "" });
    render(<TelemetryDeckProvider telemetryDeck={td} />);
  });
  test("Given an appId and clientUser, when creating a telemetryDeck, then the insance has the correct appID", () => {
    const td = createTelemetryDeck({ appID: "my-app-id", clientUser: "" });
    expect(td).toBeInstanceOf(Object);
    expect(td.appID).toBe("my-app-id");
  });
  test("Given an undefined appID, when creating telemetryDeck, then an error should be thrown", () => {
    let error;
    try {
      // @ts-expect-error since we are testing an edge case where users using javaScript might pass undefined values
      createTelemetryDeck({ appID: undefined, clientUser: "" });
    } catch (e) {
      error = e;
    }
    expect(error).toBeDefined();
  });
});
