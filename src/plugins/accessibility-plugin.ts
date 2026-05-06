/* eslint-disable max-len */
import { PayloadEnhancer, TelemetryDeckReactSDKPlugin } from "../create-telemetrydeck";

function getPreferredContentSizeCategory(): string | undefined {
  if (typeof document === "undefined") {
    return undefined;
  }
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
  if (typeof window === "undefined") {
    return {};
  }

  const result: Record<string, string> = {};

  const isReduceMotionEnabled = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  result["TelemetryDeck.Accessibility.isReduceMotionEnabled"] = String(isReduceMotionEnabled);

  const isReduceTransparencyEnabled = window.matchMedia("(prefers-reduced-transparency: reduce)").matches;
  result["TelemetryDeck.Accessibility.isReduceTransparencyEnabled"] = String(isReduceTransparencyEnabled);

  const shouldDifferentiateWithoutColor = window.matchMedia("(forced-colors: active)").matches;
  result["TelemetryDeck.Accessibility.shouldDifferentiateWithoutColor"] = String(shouldDifferentiateWithoutColor);

  const preferredContentSizeCategory = getPreferredContentSizeCategory();
  if (preferredContentSizeCategory) {
    result["TelemetryDeck.Accessibility.preferredContentSizeCategory"] = preferredContentSizeCategory;
  }

  return result;
}

const accessibilityPlugin: TelemetryDeckReactSDKPlugin = (next: PayloadEnhancer) => (payload: Record<string, unknown>) => {
  // eslint-disable-next-line callback-return
  const enhancedPayload = next(payload);

  return {
    ...enhancedPayload,
    ...getAccessibilityInfo(),
  };
};

export { accessibilityPlugin };
