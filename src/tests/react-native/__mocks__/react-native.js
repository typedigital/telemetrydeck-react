module.exports = {
  Platform: { OS: "ios", Version: "17.0" },
  Dimensions: { get: () => ({ width: 390, height: 844 }) },
  PixelRatio: { get: () => 3 },
  Appearance: { getColorScheme: () => "dark" },
  I18nManager: { isRTL: false },
  AccessibilityInfo: {
    isReduceMotionEnabled: () => Promise.resolve(true),
    isReduceTransparencyEnabled: () => Promise.resolve(false),
    isScreenReaderEnabled: () => Promise.resolve(true),
    isBoldTextEnabled: () => Promise.resolve(false),
    isGrayscaleEnabled: () => Promise.resolve(false),
    isInvertColorsEnabled: () => Promise.resolve(true),
  },
};
