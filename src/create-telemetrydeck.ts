/* eslint-disable @typescript-eslint/consistent-type-assertions */
import TelemetryDeck, { TelemetryDeckOptions } from "@telemetrydeck/sdk";
import { LIB_VERSION } from "./version";
import validatePlugin from "./plugins/validate";

type PayloadEnhancer = (payload: Record<string, unknown>) => Record<string, unknown>;

type TelemetryDeckReactSDK = TelemetryDeck & {
  payloadEnhancer?: PayloadEnhancer,
  cleanup?: () => void,
};

type TelemetryDeckReactSDKObjectPlugin = {
  enhance?: (next: PayloadEnhancer) => PayloadEnhancer,
  setup?: (td: TelemetryDeckReactSDK) => (() => void) | undefined,
};

type TelemetryDeckReactSDKPlugin =
  | ((next: PayloadEnhancer) => PayloadEnhancer)
  | TelemetryDeckReactSDKObjectPlugin;

type TelemetryDeckReactSDKOptions = TelemetryDeckOptions & {
  plugins?: TelemetryDeckReactSDKPlugin[],
  defaultParameters?: Record<string, unknown>,
};

/**
 * Creates the base enhancer function which adds the library version
 * and merges default parameters (if provided).
 * This is the innermost function in the chain.
 */
const createBaseEnhancer = (
  version: string,
  defaultParameters?: Record<string, unknown>,
): PayloadEnhancer => (payload) => ({
  ...defaultParameters,
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
  return undefined;
};

function createTelemetryDeck(
  options: TelemetryDeckReactSDKOptions & { namespace: string },
): TelemetryDeckReactSDK {
  const { plugins, appID, namespace, target, defaultParameters, ...opts } = options;
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

  const telemetryDeckReactSDK: TelemetryDeckReactSDK = telemetrydeck;

  // Separate function-plugins from object-plugins
  const allPlugins = plugins ?? [];
  const functionPlugins = allPlugins.filter(
    (p): p is (next: PayloadEnhancer) => PayloadEnhancer => typeof p === "function",
  );
  const objectPlugins = allPlugins.filter(
    (p): p is TelemetryDeckReactSDKObjectPlugin => typeof p !== "function",
  );

  // Collect all enhancers (from function plugins + object plugins with enhance)
  const objectEnhancers = objectPlugins
    .map((p) => p.enhance)
    .filter((e): e is (next: PayloadEnhancer) => PayloadEnhancer => Boolean(e));
  const allEnhancers: ((next: PayloadEnhancer) => PayloadEnhancer)[] = [
    ...functionPlugins,
    ...objectEnhancers,
  ];

  // Build enhancer chain
  const baseEnhancer = createBaseEnhancer(LIB_VERSION, defaultParameters);
  telemetryDeckReactSDK.payloadEnhancer = allEnhancers.reduce(
    (currentEnhancer, pluginDecorator) => pluginDecorator(currentEnhancer), baseEnhancer,
  );

  // Call setup() on object plugins and collect cleanup functions
  const cleanups = objectPlugins
    .map((p) => p.setup)
    .filter((s): s is NonNullable<typeof s> => Boolean(s))
    .map((setup) => setup(telemetryDeckReactSDK))
    .filter((c): c is () => void => typeof c === "function");

  telemetryDeckReactSDK.cleanup = () => {
    cleanups.forEach((fn) => fn());
  };

  return telemetryDeckReactSDK;
}

export { createTelemetryDeck };

export type {
  PayloadEnhancer,
  TelemetryDeckReactSDKPlugin,
  TelemetryDeckReactSDKObjectPlugin,
  TelemetryDeckReactSDKOptions,
  TelemetryDeckReactSDK,
};
