import TelemetryDeck, { TelemetryDeckPayload, TelemetryDeckOptions } from "@telemetrydeck/sdk";
import { LIB_VERSION } from "../version";

const mockQueue = jest.fn().mockImplementation(
  async (td: TelemetryDeck, type: string, payload?: TelemetryDeckPayload, options?: TelemetryDeckOptions) => {
    await td.queue(type, { ...payload, tdReactVersion: LIB_VERSION }, options);
  },
);

export default mockQueue;
