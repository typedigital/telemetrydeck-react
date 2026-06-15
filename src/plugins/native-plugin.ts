/* eslint-disable max-len */
import { PayloadEnhancer, TelemetryDeckReactSDKPlugin } from "../create-telemetrydeck";
import { LIB_VERSION } from "../version";
import { getRNApis } from "./react-native-apis";

const SDK_NAME = "TelemetryDeck React SDK";

// Module-level cache for async RN accessibility values
const rnAccessibilityCache: Record<string, boolean> = {};
let rnAccessibilityCacheInitialized = false;

function cacheAccessibilityValue(method: (() => Promise<boolean>) | undefined, key: string): void {
  if (typeof method !== "function") {
    return;
  }
  // eslint-disable-next-line promise/catch-or-return, promise/always-return
  method().then((value) => {
    rnAccessibilityCache[key] = value;
  // eslint-disable-next-line no-empty-function
  }, () => null);
}

function initAccessibilityCache(): void {
  if (rnAccessibilityCacheInitialized) {
    return;
  }
  rnAccessibilityCacheInitialized = true;

  const { AccessibilityInfo } = getRNApis();
  if (!AccessibilityInfo) {
    return;
  }

  cacheAccessibilityValue(AccessibilityInfo.isReduceMotionEnabled, "isReduceMotionEnabled");
  cacheAccessibilityValue(AccessibilityInfo.isReduceTransparencyEnabled, "isReduceTransparencyEnabled");
  cacheAccessibilityValue(AccessibilityInfo.isScreenReaderEnabled, "isScreenReaderEnabled");
  cacheAccessibilityValue(AccessibilityInfo.isBoldTextEnabled, "isBoldTextEnabled");
  cacheAccessibilityValue(AccessibilityInfo.isGrayscaleEnabled, "isGrayscaleEnabled");
  cacheAccessibilityValue(AccessibilityInfo.isInvertColorsEnabled, "isInvertColorsEnabled");
}

function getNativeInfo(): Record<string, string | number> {
  const { Platform, Dimensions, PixelRatio, Appearance, I18nManager } = getRNApis();
  const result: Record<string, string | number> = {
    "TelemetryDeck.SDK.name": SDK_NAME,
    "TelemetryDeck.SDK.version": LIB_VERSION,
    "TelemetryDeck.SDK.nameAndVersion": `${SDK_NAME} ${LIB_VERSION}`,
  };

  // Device info
  if (Platform) {
    result["TelemetryDeck.Device.platform"] = Platform.OS;
  }

  if (Dimensions) {
    const { width, height } = Dimensions.get("window");
    const smallest = Math.min(width, height);
    result["TelemetryDeck.Device.type"] = smallest >= 600 ? "tablet" : "mobile";
    result["TelemetryDeck.Device.screenResolutionWidth"] = width;
    result["TelemetryDeck.Device.screenResolutionHeight"] = height;
  }

  if (PixelRatio) {
    result["TelemetryDeck.Device.screenScaleFactor"] = PixelRatio.get();
  }

  // Locale
  try {
    const { locale } = new Intl.DateTimeFormat().resolvedOptions();
    if (locale) {
      const [shortLanguage] = locale.split("-");
      result["TelemetryDeck.RunContext.language"] = shortLanguage;
      result["TelemetryDeck.RunContext.locale"] = locale;
    }
  } catch { /* Intl not available */ }

  try {
    const { timeZone } = new Intl.DateTimeFormat().resolvedOptions();
    if (timeZone) {
      result["TelemetryDeck.Device.timeZone"] = timeZone;
    }
  } catch { /* Intl not available */ }

  // User preferences
  if (Appearance) {
    const colorScheme = Appearance.getColorScheme();
    if (colorScheme) {
      result["TelemetryDeck.UserPreference.colorScheme"] = colorScheme;
    }
  }

  if (I18nManager) {
    result["TelemetryDeck.UserPreference.layoutDirection"] = I18nManager.isRTL ? "rtl" : "ltr";
  }

  // Accessibility (async cached values)
  initAccessibilityCache();

  for (const [key, value] of Object.entries(rnAccessibilityCache)) {
    result[`TelemetryDeck.Accessibility.${key}`] = String(value);
  }

  return result;
}

// eslint-disable-next-line max-len
const nativePlugin: TelemetryDeckReactSDKPlugin = (next: PayloadEnhancer) => (payload: Record<string, unknown>) => {
  // eslint-disable-next-line callback-return
  const enhancedPayload = next(payload);

  return {
    ...enhancedPayload,
    ...getNativeInfo(),
  };
};

export { nativePlugin };
