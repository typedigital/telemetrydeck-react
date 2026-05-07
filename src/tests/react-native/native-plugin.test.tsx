/* eslint-disable max-len */
/* eslint-disable promise/avoid-new */
import { createTelemetryDeck } from "../../create-telemetrydeck";
import { nativePlugin } from "../../plugins/native-plugin";
import { LIB_VERSION } from "../../version";
import { appID, namespace } from "../test-utils/variables";

function createPayload() {
  const td = createTelemetryDeck({
    appID,
    clientUser: "anonymous",
    namespace,
    plugins: [nativePlugin],
  });
  return td.payloadEnhancer?.({}) ?? {};
}

describe("Device info", () => {
  test("Returns platform from Platform.OS", () => {
    const payload = createPayload();
    expect(payload["TelemetryDeck.Device.platform"]).toBe("ios");
  });

  test("Returns device type mobile for small screens", () => {
    const payload = createPayload();
    expect(payload["TelemetryDeck.Device.type"]).toBe("mobile");
  });

  test("Returns screen dimensions from Dimensions API", () => {
    const payload = createPayload();
    expect(payload["TelemetryDeck.Device.screenResolutionWidth"]).toBe(390);
    expect(payload["TelemetryDeck.Device.screenResolutionHeight"]).toBe(844);
  });

  test("Returns pixel ratio from PixelRatio API", () => {
    const payload = createPayload();
    expect(payload["TelemetryDeck.Device.screenScaleFactor"]).toBe(3);
  });

  test("Returns timezone from Intl", () => {
    const payload = createPayload();
    expect(payload["TelemetryDeck.Device.timeZone"]).toBeDefined();
  });
});

describe("SDK info", () => {
  test("Includes SDK name and version", () => {
    const payload = createPayload();
    expect(payload["TelemetryDeck.SDK.name"]).toBe("TelemetryDeck React SDK");
    expect(payload["TelemetryDeck.SDK.version"]).toBe(LIB_VERSION);
    expect(payload["TelemetryDeck.SDK.nameAndVersion"]).toBe(`TelemetryDeck React SDK ${LIB_VERSION}`);
  });
});

describe("User preferences", () => {
  test("Returns color scheme from Appearance API", () => {
    const payload = createPayload();
    expect(payload["TelemetryDeck.UserPreference.colorScheme"]).toBe("dark");
  });

  test("Returns layout direction from I18nManager", () => {
    const payload = createPayload();
    expect(payload["TelemetryDeck.UserPreference.layoutDirection"]).toBe("ltr");
  });
});

describe("Accessibility", () => {
  test("Returns cached accessibility values after async resolves", async () => {
    const td = createTelemetryDeck({
      appID,
      clientUser: "anonymous",
      namespace,
      plugins: [nativePlugin],
    });

    // First call triggers async cache init — wait for microtask queue to flush
    td.payloadEnhancer?.({});
    await new Promise((resolve) => {
      setTimeout(resolve, 10);
    });

    // Second call should have cached values
    const payload = td.payloadEnhancer?.({}) ?? {};
    expect(payload["TelemetryDeck.Accessibility.isReduceMotionEnabled"]).toBe("true");
    expect(payload["TelemetryDeck.Accessibility.isReduceTransparencyEnabled"]).toBe("false");
    expect(payload["TelemetryDeck.Accessibility.isScreenReaderEnabled"]).toBe("true");
    expect(payload["TelemetryDeck.Accessibility.isBoldTextEnabled"]).toBe("false");
    expect(payload["TelemetryDeck.Accessibility.isGrayscaleEnabled"]).toBe("false");
    expect(payload["TelemetryDeck.Accessibility.isInvertColorsEnabled"]).toBe("true");
  });

  test("Does not include web-only accessibility fields", async () => {
    const td = createTelemetryDeck({
      appID,
      clientUser: "anonymous",
      namespace,
      plugins: [nativePlugin],
    });

    await new Promise((resolve) => {
      setTimeout(resolve, 10);
    });

    const payload = td.payloadEnhancer?.({}) ?? {};
    expect(payload["TelemetryDeck.Accessibility.shouldDifferentiateWithoutColor"]).toBeUndefined();
    expect(payload["TelemetryDeck.Accessibility.preferredContentSizeCategory"]).toBeUndefined();
  });
});
