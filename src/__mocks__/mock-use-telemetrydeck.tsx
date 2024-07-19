/* eslint-disable import/extensions */

import * as telemetryDeck from "../use-telemetrydeck";
import mockQueue from "./mock-queue";
import mockSignal from "./mock-signal";

jest.mock("./use-telemetrydeck", () => {
  const originalModule = jest.requireActual("./use-telemetrydeck");
  const mockedModule: typeof telemetryDeck = {
    ...originalModule,
    useTelemetryDeck: {
      signal: mockSignal,
      queue: mockQueue,
    },
  };
  return mockedModule;
});

export default telemetryDeck;
