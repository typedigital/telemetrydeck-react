/* eslint-disable no-console */
import { useCallback, useContext } from "react";
import TelemetryDeck, { TelemetryDeckOptions, TelemetryDeckPayload } from "@telemetrydeck/sdk";
import { TelemetryDeckContext } from "./telemetrydeck-context";
import { LIB_VERSION } from "./version";
import {
  TelemetryDeckReactSDK,
  TelemetryDeckReactSDKOptions,
  TelemetryDeckReactSDKPlugins,
} from "./create-telemetrydeck";
import telemetryDeckPlugins from "./plugins";

type EnhancedPayload = TelemetryDeckPayload & { tdReactVersion?: string } & Record<string, unknown>;

type Return = {
  signal: (
    type: string, payload?: TelemetryDeckPayload, options?: TelemetryDeckOptions
  ) => Promise<Response | undefined>,
  queue: (
    type: string, payload?: TelemetryDeckPayload, options?: TelemetryDeckOptions
  ) => void,
};

function enhancePayload(payload: EnhancedPayload = {}, plugins?: TelemetryDeckReactSDKPlugins[]): EnhancedPayload {
  if (!plugins || plugins.length === 0) {
    return { ...payload, tdReactVersion: LIB_VERSION };
  }

  const [currentPlugin, ...remainingPlugins] = plugins;

  const telemetryDeckPlugin = telemetryDeckPlugins[currentPlugin];
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!telemetryDeckPlugin) {
    return enhancePayload(payload, remainingPlugins);
  }
  const pluginResult = telemetryDeckPlugins[currentPlugin]();
  const updatedPayload = { ...payload, ...pluginResult };
  return enhancePayload(updatedPayload, remainingPlugins);
}

/*
  We need to omit the default signal and queue methods in order to make them optional
  in the context type. This is because we return an empty object if the appID is not
  provided to the createTelemetryDeck function. This is a workaround for the fact
  that the TelemetryDeck class does not have a default constructor.

  We need to provide a default value for the context in order to differentiate between
  the case where the context is not available and the case where the appID is not provided.

  This is not ideal, but it works for now. We should consider refactoring the TelemetryDeck
  class to allow for a default constructor in the future.
*/
type TelemetrydeckContextType = Omit<TelemetryDeckReactSDK, "signal" | "queue"> & {
  signal?: TelemetryDeck["signal"],
  queue?: TelemetryDeck["queue"],
} | undefined;

function useTelemetryDeck(): Return {
  const td: TelemetrydeckContextType = useContext(TelemetryDeckContext);

  if (td === undefined) {
    throw new Error("useTelemetryDeck must be used within a TelemetryDeckProvider");
  }

  const signal = useCallback(async (
    type: string, payload?: TelemetryDeckPayload, options?: TelemetryDeckReactSDKOptions,
  ) => {
    if (!td.signal) {
      console.error("TelemetryDeck: signal method is not available");
      return undefined;
    }

    return td.signal(type, enhancePayload(payload, td.plugins), options);
  }, [td]);

  const queue = useCallback(async (
    type: string, payload?: TelemetryDeckPayload, options?: TelemetryDeckReactSDKOptions,
  ) => {
    if (!td.queue) {
      console.error("TelemetryDeck: queue method is not available");
      return;
    }

    await td.queue(type, enhancePayload(payload, td.plugins), options);
  }, [td]);

  return {
    signal,
    queue,
  };
}

export { useTelemetryDeck, enhancePayload };
