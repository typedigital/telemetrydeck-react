import { useCallback, useContext } from "react";
import { TelemetryDeckContext } from "./telemetrydeck-context";
import { LIB_VERSION } from "./version";

type Method = string;
type Payload = Record<string, string | number | boolean>;

type Return = {
  app: (appId: string) => void,
  user: (identifier: string) => void,
  signal: (payload?: Payload) => Promise<Response | undefined>,
  ingest: (queue: [Method, Payload?][]) => void,
  push: (tuple: [Method, Payload?]) => Promise<void>,
};

function enhancePayload(payload: Payload = {}): Payload {
  return { ...payload, tdReactVersion: LIB_VERSION };
}

function useTelemetryDeck(): Return {
  const td = useContext(TelemetryDeckContext);

  if (td === undefined) {
    throw new Error("useTelemetryDeck must be used within a TelemetryDeckProvider");
  }

  const app = useCallback((appId: string) => td.app(appId), [td]);

  const user = useCallback((identifier: string) => td.user(identifier), [td]);

  const signal = useCallback(async (payload?: Record<string, string | number | boolean>) => {
    return td.signal(enhancePayload(payload));
  }, [td]);

  const ingest = useCallback((queue: [Method, Payload?][]) => {
    const enhancedQueue: [Method, Payload][] = queue.map(
      ([method, payload]) => [method, enhancePayload(payload)],
    );
    td.ingest(enhancedQueue);
  }, [td]);

  const push = useCallback(async (tuple: [Method, Payload?]) => {
    const [method, payload] = tuple;
    const enhancedTuple: [Method, Payload] = [method, enhancePayload(payload)];
    return td.push(enhancedTuple);
  }, [td]);

  return {
    app,
    user,
    signal,
    ingest,
    push,
  };
}

export { useTelemetryDeck };
