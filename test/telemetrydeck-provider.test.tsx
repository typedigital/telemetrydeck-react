import React from "react";
import ReactDOM from "react-dom";
import { TelemetryDeckProvider, createTelemetryDeck } from "../src";

describe("TelemetryDeckProvider", () => {
  it("renders without crashing for React 16 to 17", () => {
    const td = createTelemetryDeck({ appID: "my-app-id", clientUser: "" });
    const div = document.createElement("div");
    ReactDOM.render(<TelemetryDeckProvider telemetryDeck={td} />, div);
    ReactDOM.unmountComponentAtNode(div);
  });
});
