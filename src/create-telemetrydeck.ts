import TelemetryDeck from "@telemetrydeck/sdk";

type TelemetryDeckOptions = {
  appID: string,
  clientUser: string,
  target?: string,
  sessionID?: string,
  salt?: string,
  testMode?: boolean,
};

function createTelemetryDeck(options: TelemetryDeckOptions): TelemetryDeck {
  return new TelemetryDeck(options);
}

export { createTelemetryDeck };
export type { TelemetryDeckOptions };
