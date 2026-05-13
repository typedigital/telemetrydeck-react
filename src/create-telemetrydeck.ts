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
  // React Native / Metro bundler: __DEV__ is true in development
  if (typeof __DEV__ !== "undefined" && __DEV__) {
    return true;
  }
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (typeof window !== "undefined" && window.location) {
    const { hostname } = window.location;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return true;
    }
  }
  return undefined;
};

function createTelemetryDeck(
  options: TelemetryDeckReactSDKOptions & { namespace: string },
): TelemetryDeckReactSDK {
  const { plugins, appID, namespace, target, ...opts } = options;
  if (!appID) {
    throw new Error("appID has to be defined.");
  }
  if (!namespace || namespace.trim() === "") {
    throw new Error(
      "namespace has to be defined and cannot be blank."
      + " You can find your namespace in the TelemetryDeck Dashboard.",
    );
  }
  (plugins ?? []).forEach(validatePlugin);

  const resolvedTarget = target ?? `https://nom.telemetrydeck.com/v2/namespace/${namespace}/`;
  const testMode = opts.testMode === undefined ? isLocalhost() : opts.testMode;
  const telemetrydeck = new TelemetryDeck({ appID, testMode, target: resolvedTarget, ...opts });

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
