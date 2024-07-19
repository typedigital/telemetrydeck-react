import TelemetryDeck, { TelemetryDeckPayload, TelemetryDeckOptions } from "@telemetrydeck/sdk";
import { LIB_VERSION } from "../version";

const mockSignal = jest.fn().mockImplementation(
  async (td: TelemetryDeck, type: string, payload?: TelemetryDeckPayload, options?: TelemetryDeckOptions) => {
    return td.signal(type, { ...payload, tdReactVersion: LIB_VERSION }, options);
  },
);

export default mockSignal;
