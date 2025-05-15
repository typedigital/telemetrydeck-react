import { useCallback, useContext } from "react";
import { TelemetryDeckOptions, TelemetryDeckPayload } from "@telemetrydeck/sdk";
import { TelemetryDeckContext } from "./telemetrydeck-context";
import { LIB_VERSION } from "./version";
import { TelemetryDeckReactSDKOptions, TelemetryDeckReactSDKPlugins } from "./create-telemetrydeck";
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

function useTelemetryDeck(): Return {
  const td = useContext(TelemetryDeckContext);

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
