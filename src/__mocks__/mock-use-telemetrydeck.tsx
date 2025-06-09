/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable import/extensions */

import { createTelemetryDeck } from "src/create-telemetrydeck";
import { appID } from "src/test-utils/variables";
import * as telemetryDeck from "../use-telemetrydeck";

jest.mock("./use-telemetrydeck", () => {
  const td = createTelemetryDeck({ appID, clientUser: "anonymous" });
  const originalModule = jest.requireActual("./use-telemetrydeck");
  const mockedModule: typeof telemetryDeck = {
    ...originalModule,
    useTelemetryDeck: {
      signal: td.signal,
      queue: td.queue,
    },
  };
  return mockedModule;
});

export default telemetryDeck;
