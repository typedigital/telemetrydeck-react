/* eslint-disable @typescript-eslint/consistent-type-assertions */
import TelemetryDeck, { TelemetryDeckOptions } from "@telemetrydeck/sdk";
import validatePlugin from "./plugins/validate";

type TelemetryDeckReactSDKPlugin = {
  name: string,
  getPluginPayload: () => Record<string, unknown>,
};

type TelemetryDeckReactSDKOptions = TelemetryDeckOptions & {
  plugins?: TelemetryDeckReactSDKPlugin[],
};

type TelemetryDeckReactSDK = TelemetryDeck & {
  plugins?: TelemetryDeckReactSDKPlugin[],
};

function createTelemetryDeck(
  options: TelemetryDeckReactSDKOptions,
): TelemetryDeckReactSDK {
  const { plugins, appID, ...opts } = options;
  if (!appID) {
    throw new Error("appId has to be defined");
  }
  const telemetrydeck = new TelemetryDeck({ appID, ...opts });

  // This conversion to TelemetryDeckReactSDK is done in order to allow adding our plugins to the response
  const telemetryDeckReactSDK: TelemetryDeckReactSDK = telemetrydeck;
  if (plugins && Array.isArray(plugins)) {
    plugins.forEach((plugin) => {
      validatePlugin(plugin);
    });
    telemetryDeckReactSDK.plugins = plugins;
  }
  return telemetryDeckReactSDK;
}

export { createTelemetryDeck };

export type {
  TelemetryDeckReactSDKOptions,
  TelemetryDeckReactSDKPlugin,
  TelemetryDeckReactSDK,
};
