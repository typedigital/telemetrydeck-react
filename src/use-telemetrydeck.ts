/* eslint-disable no-console */
import { useCallback, useContext } from "react";
import { TelemetryDeckOptions, TelemetryDeckPayload } from "@telemetrydeck/sdk";
import { TelemetryDeckContext } from "./telemetrydeck-context";
import { LIB_VERSION } from "./version";
import {
  TelemetryDeckReactSDK,
  TelemetryDeckReactSDKOptions,
  TelemetryDeckReactSDKPlugin,
} from "./create-telemetrydeck";

type EnhancedPayload = TelemetryDeckPayload & { tdReactVersion?: string } & Record<string, unknown>;

type Return = {
  signal: (
    type: string, payload?: TelemetryDeckPayload, options?: TelemetryDeckOptions
  ) => Promise<Response | undefined>,
  queue: (
    type: string, payload?: TelemetryDeckPayload, options?: TelemetryDeckOptions
  ) => void,
};

function enhancePayload(
  payload: EnhancedPayload = {},
  plugins?: TelemetryDeckReactSDKPlugin[],
): EnhancedPayload {
  const defaultPayload = {
    tdReactVersion: LIB_VERSION,
    ...payload,
  };
  Object.assign(
    defaultPayload,
    ...(plugins ? plugins.map(({ getPluginPayload }) => getPluginPayload()) : []),
  );
  return defaultPayload;
}

function useTelemetryDeck(): Return {
  const td: TelemetryDeckReactSDK | undefined = useContext(TelemetryDeckContext);

  if (td === undefined) {
    throw new Error("useTelemetryDeck must be used within a TelemetryDeckProvider");
  }

  const signal = useCallback(async (
    type: string, payload?: TelemetryDeckPayload, options?: TelemetryDeckReactSDKOptions,
  ) => {
    return td.signal(type, enhancePayload(payload, td.plugins), options);
  }, [td]);

  const queue = useCallback(async (
    type: string, payload?: TelemetryDeckPayload, options?: TelemetryDeckReactSDKOptions,
  ) => {
    await td.queue(type, enhancePayload(payload, td.plugins), options);
  }, [td]);

  return {
    signal,
    queue,
  };
}

export { useTelemetryDeck, enhancePayload };
