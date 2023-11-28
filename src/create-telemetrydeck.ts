import TelemetryDeck, { TelemetryDeckOptions } from "@telemetrydeck/sdk";

function createTelemetryDeck(options: TelemetryDeckOptions): TelemetryDeck {
  return new TelemetryDeck(options);
}

export { createTelemetryDeck };
