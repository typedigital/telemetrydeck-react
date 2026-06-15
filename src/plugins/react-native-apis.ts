/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-require-imports */

type RNApis = {
  Platform?: {
    OS: string,
    Version: string | number,
  },
  Dimensions?: {
    get: (dim: "window" | "screen") => { width: number, height: number },
  },
  PixelRatio?: {
    get: () => number,
  },
  Appearance?: {
    getColorScheme: () => "light" | "dark" | null,
  },
  I18nManager?: {
    isRTL: boolean,
  },
  AccessibilityInfo?: {
    isReduceMotionEnabled: () => Promise<boolean>,
    isReduceTransparencyEnabled?: () => Promise<boolean>,
    isScreenReaderEnabled?: () => Promise<boolean>,
    isBoldTextEnabled?: () => Promise<boolean>,
    isGrayscaleEnabled?: () => Promise<boolean>,
    isInvertColorsEnabled?: () => Promise<boolean>,
  },
};

let cached: RNApis | undefined;

/**
 * Dynamically loads React Native APIs using require().
 * Returns an object with available APIs, or empty object on failure.
 * Results are cached after first call.
 */
export function getRNApis(): RNApis {
  if (cached !== undefined) {
    return cached;
  }
  try {
    // eslint-disable-next-line global-require
    const RN = require("react-native");
    cached = {
      Platform: RN.Platform,
      Dimensions: RN.Dimensions,
      PixelRatio: RN.PixelRatio,
      Appearance: RN.Appearance,
      I18nManager: RN.I18nManager,
      AccessibilityInfo: RN.AccessibilityInfo,
    };
  } catch {
    cached = {};
  }
  return cached;
}

export type { RNApis };
