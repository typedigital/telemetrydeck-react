/* eslint-disable max-len */
import { PayloadEnhancer, TelemetryDeckReactSDKPlugin } from "../create-telemetrydeck";
import { LIB_VERSION } from "../version";

const SDK_NAME = "TelemetryDeck React SDK";

function getColorScheme(): string | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  if (window.matchMedia("(prefers-color-scheme: light)").matches) {
    return "light";
  }
  return undefined;
}

function getLayoutDirection(): string | undefined {
  if (typeof document === "undefined") {
    return undefined;
  }
  return document.dir
    || document.documentElement.dir
    || window.getComputedStyle(document.documentElement).direction
    || undefined;
}

function getTimeZone(): string | undefined {
  try {
    return new Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return undefined;
  }
}

function getEnvironmentInfo(): Record<string, string | number> {
  const result: Record<string, string | number> = {
    "TelemetryDeck.SDK.name": SDK_NAME,
    "TelemetryDeck.SDK.version": LIB_VERSION,
    "TelemetryDeck.SDK.nameAndVersion": `${SDK_NAME} ${LIB_VERSION}`,
  };

  if (typeof window === "undefined") {
    return result;
  }

  const { width, height } = window.screen;
  result["TelemetryDeck.Device.screenResolutionWidth"] = width;
  result["TelemetryDeck.Device.screenResolutionHeight"] = height;
  result["TelemetryDeck.Device.screenScaleFactor"] = window.devicePixelRatio;

  const timeZone = getTimeZone();
  if (timeZone) {
    result["TelemetryDeck.Device.timeZone"] = timeZone;
  }

  const screenWithOrientation = screen as unknown as { orientation?: { type?: string } };
  if (screenWithOrientation.orientation?.type) {
    result["TelemetryDeck.Device.orientation"] = screenWithOrientation.orientation.type;
  }

  const { language } = navigator;
  if (language) {
    const [shortLanguage] = language.split("-");
    result["TelemetryDeck.RunContext.language"] = shortLanguage;
    result["TelemetryDeck.RunContext.locale"] = language;
  }

  const colorScheme = getColorScheme();
  if (colorScheme) {
    result["TelemetryDeck.UserPreference.colorScheme"] = colorScheme;
  }

  const layoutDirection = getLayoutDirection();
  if (layoutDirection) {
    result["TelemetryDeck.UserPreference.layoutDirection"] = layoutDirection;
  }

  return result;
}

const environmentPlugin: TelemetryDeckReactSDKPlugin = (next: PayloadEnhancer) => (payload: Record<string, unknown>) => {
  // eslint-disable-next-line callback-return
  const enhancedPayload = next(payload);

  return {
    ...enhancedPayload,
    ...getEnvironmentInfo(),
  };
};

export { environmentPlugin };
