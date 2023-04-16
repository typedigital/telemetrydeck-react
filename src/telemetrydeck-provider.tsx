import { TelemetryDeck } from "@telemetrydeck/sdk";
import React, { ReactNode } from "react";
import { TelemetryDeckContext } from "./telemetrydeck-context";

type ProviderProps = {
  children?: ReactNode,
  telemetryDeck: TelemetryDeck,
};

function TelemetryDeckProvider({ children, telemetryDeck }: ProviderProps) {
  const Context = TelemetryDeckContext;
  return (
    <Context.Provider value={telemetryDeck}>
      {children}
    </Context.Provider>
  );
}

export {
  TelemetryDeckProvider,
};
