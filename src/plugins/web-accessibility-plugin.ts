/* eslint-disable max-len */
import { PayloadEnhancer, TelemetryDeckReactSDKPlugin } from "../create-telemetrydeck";

function getPreferredContentSizeCategory(): string | undefined {
  const rootFontSize = parseFloat(
    window.getComputedStyle(document.documentElement).fontSize,
  );
  if (rootFontSize <= 12) {
    return "small";
  }
  if (rootFontSize <= 16) {
    return "medium";
  }
  if (rootFontSize <= 20) {
    return "large";
  }
  return "extraLarge";
}

function getAccessibilityInfo(): Record<string, string> {
  const result: Record<string, string> = {};

  result["TelemetryDeck.Accessibility.isReduceMotionEnabled"] = String(
    window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  result["TelemetryDeck.Accessibility.isReduceTransparencyEnabled"] = String(
    window.matchMedia("(prefers-reduced-transparency: reduce)").matches,
  );
  result["TelemetryDeck.Accessibility.shouldDifferentiateWithoutColor"] = String(
    window.matchMedia("(forced-colors: active)").matches,
  );

  const preferredContentSizeCategory = getPreferredContentSizeCategory();
  if (preferredContentSizeCategory) {
    result["TelemetryDeck.Accessibility.preferredContentSizeCategory"] = preferredContentSizeCategory;
  }

  return result;
}

const webAccessibilityPlugin: TelemetryDeckReactSDKPlugin = (next: PayloadEnhancer) => (payload: Record<string, unknown>) => {
  // eslint-disable-next-line callback-return
  const enhancedPayload = next(payload);

  return {
    ...enhancedPayload,
    ...getAccessibilityInfo(),
  };
};

export { webAccessibilityPlugin };
