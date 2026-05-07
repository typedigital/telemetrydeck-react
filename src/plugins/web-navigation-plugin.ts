import { PayloadEnhancer, TelemetryDeckReactSDKPlugin } from "../create-telemetrydeck";

const getNavigationInfo = (): Record<string, string> => {
  return {
    "TelemetryDeck.Navigation.destinationPath": window.location.pathname,
    "TelemetryDeck.Navigation.referrer": document.referrer,
  };
};

// eslint-disable-next-line max-len
const webNavigationPlugin: TelemetryDeckReactSDKPlugin = (next: PayloadEnhancer) => (payload: Record<string, unknown>) => {
  // eslint-disable-next-line callback-return
  const enhancedPayload = next(payload);

  return {
    ...enhancedPayload,
    ...getNavigationInfo(),
  };
};

export { webNavigationPlugin };
