import { TelemetryDeck } from "@telemetrydeck/sdk";
import { createContext } from "react";

const TelemetryDeckContext = createContext<TelemetryDeck | undefined>(undefined);

export { TelemetryDeckContext };
