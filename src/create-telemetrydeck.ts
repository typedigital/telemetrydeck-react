import TelemetryDeck, { TelemetryDeckOptions } from "@telemetrydeck/sdk";

type TelemetryDeckReactSDKPlugins = "browserPlugin";

type TelemetryDeckReactSDKOptions = TelemetryDeckOptions & {
  plugins?: TelemetryDeckReactSDKPlugins[],
};

type TelemetryDeckReactSDK = TelemetryDeck & {
  plugins?: TelemetryDeckReactSDKPlugins[],
};

function createTelemetryDeck(options: TelemetryDeckReactSDKOptions): TelemetryDeckReactSDK {
  const telemetrydeck: TelemetryDeckReactSDK = new TelemetryDeck(options);
  if (options.plugins) {
    telemetrydeck.plugins = options.plugins;
  }
  return telemetrydeck;
}

export { createTelemetryDeck };

export type {
  TelemetryDeckReactSDKOptions,
  TelemetryDeckReactSDKPlugins,
  TelemetryDeckReactSDK,
};
