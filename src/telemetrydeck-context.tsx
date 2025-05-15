import { createContext } from "react";
import { TelemetryDeckReactSDK } from "./create-telemetrydeck";

const TelemetryDeckContext = createContext<TelemetryDeckReactSDK | undefined>(undefined);

export { TelemetryDeckContext };
