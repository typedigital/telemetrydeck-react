/* eslint-disable @typescript-eslint/consistent-type-assertions */
import TelemetryDeck, { TelemetryDeckOptions } from "@telemetrydeck/sdk";
import { LIB_VERSION } from "./version";
import validatePlugin from "./plugins/validate";

type PayloadEnhancer = (payload: Record<string, unknown>) => Record<string, unknown>;

type TelemetryDeckReactSDKPlugin = (next: PayloadEnhancer) => PayloadEnhancer;

type TelemetryDeckReactSDKOptions = TelemetryDeckOptions & {
  plugins?: TelemetryDeckReactSDKPlugin[],
};

type TelemetryDeckReactSDK = TelemetryDeck & {
  payloadEnhancer?: PayloadEnhancer,
};

/**
 * Creates the base enhancer function which adds the library version.
 * This is the innermost function in the chain.
 * @param version - The library version string.
 * @returns A PayloadEnhancer function.
 */
const createBaseEnhancer = (version: string): PayloadEnhancer => (payload) => ({
  ...payload,
  tdReactVersion: version,
});

const isLocalhost = () => {
  if (typeof window !== "undefined") {
    const { hostname } = window.location;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return true;
    }
  }
  return false;
};

function createTelemetryDeck(
  options: TelemetryDeckReactSDKOptions,
): TelemetryDeckReactSDK {
  const { plugins, appID, ...opts } = options;
  if (!appID) {
    throw new Error("appId has to be defined");
  }
  (plugins ?? []).forEach(validatePlugin);

  const telemetrydeck = new TelemetryDeck({ appID, ...opts, testMode: isLocalhost() });

  // This conversion to TelemetryDeckReactSDK is done in order to allow adding our plugins to the response
  const telemetryDeckReactSDK: TelemetryDeckReactSDK = telemetrydeck;

  const baseEnhancer = createBaseEnhancer(LIB_VERSION);
  telemetryDeckReactSDK.payloadEnhancer = (plugins ?? []).reduce(
    (currentEnhancer, pluginDecorator) => pluginDecorator(currentEnhancer), baseEnhancer,
  );

  return telemetryDeckReactSDK;
}

export { createTelemetryDeck };

export type {
  PayloadEnhancer,
  TelemetryDeckReactSDKPlugin,
  TelemetryDeckReactSDKOptions,
  TelemetryDeckReactSDK,
};
