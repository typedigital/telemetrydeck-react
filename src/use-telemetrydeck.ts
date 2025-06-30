/* eslint-disable no-console */
import { useCallback, useContext } from "react";
import { TelemetryDeckOptions, TelemetryDeckPayload } from "@telemetrydeck/sdk";
import { TelemetryDeckContext } from "./telemetrydeck-context";
import {
  TelemetryDeckReactSDK,
  TelemetryDeckReactSDKOptions,
} from "./create-telemetrydeck";

type Return = {
  signal: (
    type: string, payload?: TelemetryDeckPayload, options?: TelemetryDeckOptions
  ) => Promise<Response | undefined>,
  queue: (
    type: string, payload?: TelemetryDeckPayload, options?: TelemetryDeckOptions
  ) => void,
};

function useTelemetryDeck(): Return {
  const td: TelemetryDeckReactSDK | undefined = useContext(TelemetryDeckContext);

  if (td === undefined) {
    throw new Error("useTelemetryDeck must be used within a TelemetryDeckProvider");
  }

  const signal = useCallback(async (
    type: string, payload?: TelemetryDeckPayload, options?: TelemetryDeckReactSDKOptions,
  ) => {
    return td.signal(type, td.payloadEnhancer?.(payload ?? {}) ?? payload, options);
  }, [td]);

  const queue = useCallback(async (
    type: string, payload?: TelemetryDeckPayload, options?: TelemetryDeckReactSDKOptions,
  ) => {
    await td.queue(type, td.payloadEnhancer?.(payload ?? {}) ?? payload, options);
  }, [td]);

  return {
    signal,
    queue,
  };
}

export { useTelemetryDeck };
