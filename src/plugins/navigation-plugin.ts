import { PayloadEnhancer, TelemetryDeckReactSDKPlugin } from "../create-telemetrydeck";

const getNavigationInfo = (): Record<string, string> => {
  if (typeof window === "undefined") {
    return {};
  }

  return {
    "TelemetryDeck.Navigation.destinationPath": window.location.pathname,
    "TelemetryDeck.Navigation.referrer": document.referrer,
  };
};

const navigationPlugin: TelemetryDeckReactSDKPlugin = (next: PayloadEnhancer) => (payload: Record<string, unknown>) => {
  // eslint-disable-next-line callback-return
  const enhancedPayload = next(payload);

  return {
    ...enhancedPayload,
    ...getNavigationInfo(),
  };
};

export { navigationPlugin };
