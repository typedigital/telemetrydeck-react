import { PayloadEnhancer, TelemetryDeckReactSDKPlugin } from "../create-telemetrydeck";

function isStandaloneMode(): boolean {
  return window.matchMedia("(display-mode: standalone)").matches
    || (navigator as unknown as { standalone?: boolean }).standalone === true;
}

const webPwaPlugin: TelemetryDeckReactSDKPlugin = (next: PayloadEnhancer) => (payload: Record<string, unknown>) => {
  // eslint-disable-next-line callback-return
  const enhancedPayload = next(payload);

  return {
    ...enhancedPayload,
    "TelemetryDeck.Acquisition.isPWA": String(isStandaloneMode()),
  };
};

export { webPwaPlugin };
