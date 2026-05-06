/* eslint-disable max-len */
import { PayloadEnhancer, TelemetryDeckReactSDKObjectPlugin } from "../create-telemetrydeck";

const INSTALL_SIGNAL_TYPE = "TelemetryDeck.Acquisition.pwaInstalled";

function isStandaloneMode(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return window.matchMedia("(display-mode: standalone)").matches
    || (navigator as unknown as { standalone?: boolean }).standalone === true;
}

const pwaPlugin: TelemetryDeckReactSDKObjectPlugin = {
  enhance: (next: PayloadEnhancer) => (payload: Record<string, unknown>) => {
    // eslint-disable-next-line callback-return
    const enhancedPayload = next(payload);

    return {
      ...enhancedPayload,
      "TelemetryDeck.Acquisition.isPWA": String(isStandaloneMode()),
    };
  },

  setup: (td) => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const onInstall = async () => {
      try {
        await td.signal(INSTALL_SIGNAL_TYPE, {
          "TelemetryDeck.Acquisition.isPWA": "true",
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn("[TelemetryDeck] Failed to send PWA install signal:", error);
      }
    };

    window.addEventListener("appinstalled", onInstall);

    return () => {
      window.removeEventListener("appinstalled", onInstall);
    };
  },
};

export { pwaPlugin };
