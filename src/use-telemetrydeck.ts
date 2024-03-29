import { useCallback, useContext } from "react";
import { TelemetryDeckOptions, TelemetryDeckPayload } from "@telemetrydeck/sdk";
import { TelemetryDeckContext } from "./telemetrydeck-context";
import { LIB_VERSION } from "./version";

type EnhancedPayload = TelemetryDeckPayload & { tdReactVersion: string };

type Return = {
  signal: (
    type: string, payload?: TelemetryDeckPayload, options?: TelemetryDeckOptions
  ) => Promise<Response | undefined>,
  queue: (
    type: string, payload?: TelemetryDeckPayload, options?: TelemetryDeckOptions
  ) => void,
};

function enhancePayload(payload: TelemetryDeckPayload = {}): EnhancedPayload {
  return { ...payload, tdReactVersion: LIB_VERSION };
}

function useTelemetryDeck(): Return {
  const td = useContext(TelemetryDeckContext);

  if (td === undefined) {
    throw new Error("useTelemetryDeck must be used within a TelemetryDeckProvider");
  }

  const signal = useCallback(async (type: string, payload?: TelemetryDeckPayload, options?: TelemetryDeckOptions) => {
    return td.signal(type, enhancePayload(payload), options);
  }, [td]);

  const queue = useCallback(async (type: string, payload?: TelemetryDeckPayload, options?: TelemetryDeckOptions) => {
    await td.queue(type, enhancePayload(payload), options);
  }, [td]);

  return {
    signal,
    queue,
  };
}

export { useTelemetryDeck };
