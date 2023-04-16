import { TelemetryDeck } from "@telemetrydeck/sdk";

type Options = { target?: string, app?: string, user?: string };

function createTelemetryDeck(options?: Options): TelemetryDeck {
  return new TelemetryDeck(options);
}

export { createTelemetryDeck };
