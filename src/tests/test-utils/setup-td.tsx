import React, { ReactElement } from "react";
import TelemetryDeck from "@telemetrydeck/sdk";
import { TelemetryDeckProvider } from "../../telemetrydeck-provider";

const Setup: React.FC<{children: ReactElement, td: TelemetryDeck}> = ({ children, td }) => {
  return (
    <TelemetryDeckProvider telemetryDeck={td}>
      {children}
    </TelemetryDeckProvider>
  );
};

export default Setup;
