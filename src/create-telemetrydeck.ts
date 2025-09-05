/* eslint-disable @typescript-eslint/unified-signatures */
/* eslint-disable tsdoc/syntax */
/* eslint-disable @typescript-eslint/consistent-type-assertions */
import TelemetryDeck from "@telemetrydeck/sdk";
import { LIB_VERSION } from "./version";
import validatePlugin from "./plugins/validate";
import {
  PayloadEnhancer,
  OptionsWithBrowserPlugin,
  TelemetryDeckReactSDK,
  OptionsWithRequiredUser,
  TelemetryDeckReactSDKPlugin,
  TelemetryDeckReactSDKOptions,
} from "./types";

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
  return undefined;
};

const generateIdentifierString = (): string => {
  const osMatch = window.navigator.userAgent.match(/\(([^)]+)\)/);
  const platform = osMatch?.[1] ? osMatch[1].split("; ")[0] : null;
  const screenResolution = `${window.screen.width}x${window.screen.height}`;

  const identifierString = [
    platform || navigator.platform,
    window.navigator.hardwareConcurrency.toString(),
    screenResolution,
  ].join("");

  return identifierString;
};

/**
 * Creates TelemetryDeck instance signature for when the browser plugin is used.
 * @param options The configuration has an optional `clientUser`.
 */
function createTelemetryDeck(options: OptionsWithBrowserPlugin): TelemetryDeckReactSDK;

/**
 * Creates TelemetryDeck instance signature for the default case.
 * @param options The configuration has a required `clientUser`.
 */
function createTelemetryDeck(options: OptionsWithRequiredUser): TelemetryDeckReactSDK;

/**
 * The implementation of our createTelemetryDeck function accepting both options as a Union.
 */
function createTelemetryDeck(
  options: OptionsWithBrowserPlugin | OptionsWithRequiredUser,
): TelemetryDeckReactSDK {
  const { plugins, appID, clientUser, ...opts } = options;
  if (!appID) {
    throw new Error("appId has to be defined");
  }
  (plugins ?? []).forEach(validatePlugin);

  /**
   * Check for browser plugin to be set to allow for generation of a default identifier for our user
   * based on the userAgent only accessible in browsers
   */
  const hasBrowserPlugin = (plugins ?? []).some(
    (plugin) => plugin.name === "@telemetrydeck/browser",
  );
  const user = clientUser ?? (hasBrowserPlugin ? generateIdentifierString() : "anonymous");

  const testMode = opts.testMode === undefined ? isLocalhost() : opts.testMode;
  const telemetrydeck = new TelemetryDeck({ appID, clientUser: user, testMode, ...opts });

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
