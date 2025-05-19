/* eslint-disable @typescript-eslint/consistent-type-assertions */
import TelemetryDeck, { TelemetryDeckOptions } from "@telemetrydeck/sdk";

type TelemetryDeckReactSDKPlugins = "browserPlugin";

type TelemetryDeckReactSDKOptions = TelemetryDeckOptions & {
  plugins?: TelemetryDeckReactSDKPlugins[],
};

type TelemetryDeckReactSDK = TelemetryDeck & {
  plugins?: TelemetryDeckReactSDKPlugins[],
};

function createTelemetryDeck(
  options: Omit<TelemetryDeckReactSDKOptions, "appID"> & { appID?: string },
): TelemetryDeckReactSDK {
  if (!options.appID) {
    // eslint-disable-next-line no-console
    console.error("TelemetryDeck: appID is required");
    return {} as TelemetryDeckReactSDK;
  }
  const telemetrydeck: TelemetryDeckReactSDK = new TelemetryDeck(options as TelemetryDeckOptions);
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
