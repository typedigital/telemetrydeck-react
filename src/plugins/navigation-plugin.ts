import { TelemetryDeckReactSDKObjectPlugin } from "../create-telemetrydeck";

const SIGNAL_TYPE = "TelemetryDeck.Navigation.pathChanged";
const SCHEMA_VERSION = "1";

const navigationPlugin: TelemetryDeckReactSDKObjectPlugin = {
  setup: (td) => {
    if (typeof window === "undefined") {
      return undefined;
    }

    let previousPath = "";
    const currentPath = () => window.location.pathname;

    const sendNavigation = (from: string, to: string) => {
      if (from === to) {
        return;
      }
      previousPath = to;
      // Fire-and-forget: navigation signals are non-blocking by design.
      td.signal(SIGNAL_TYPE, {
        "TelemetryDeck.Navigation.schemaVersion": SCHEMA_VERSION,
        "TelemetryDeck.Navigation.sourcePath": from,
        "TelemetryDeck.Navigation.destinationPath": to,
        "TelemetryDeck.Navigation.identifier": `${from} -> ${to}`,
        // eslint-disable-next-line promise/prefer-await-to-callbacks
      }).catch((error) => {
        // eslint-disable-next-line no-console
        console.warn("[TelemetryDeck] Failed to send navigation signal:", error);
      });
    };

    // Initial page view (source = "" means navigation from outside the app)
    sendNavigation("", currentPath());

    // Patch history.pushState
    const origPush = history.pushState.bind(history);
    history.pushState = (...args: Parameters<typeof history.pushState>) => {
      origPush(...args);
      sendNavigation(previousPath, currentPath());
    };

    // Patch history.replaceState
    const origReplace = history.replaceState.bind(history);
    history.replaceState = (...args: Parameters<typeof history.replaceState>) => {
      origReplace(...args);
      sendNavigation(previousPath, currentPath());
    };

    // Listen for back/forward navigation
    const onPopState = () => {
      sendNavigation(previousPath, currentPath());
    };
    window.addEventListener("popstate", onPopState);

    // Cleanup: restore original methods and remove listener
    return () => {
      history.pushState = origPush;
      history.replaceState = origReplace;
      window.removeEventListener("popstate", onPopState);
    };
  },
};

export { navigationPlugin };
