/* eslint-disable max-len */
import { PayloadEnhancer, TelemetryDeckReactSDKPlugin } from "src/create-telemetrydeck";

type BrowserDetails = {
  browserName: "Opera" | "Edge" | "Chrome" | "Safari" | "Firefox",
  browserVersion: string,
};

// function extracting browser information from the User-Agent-String
const getBrowserInfo = (): Record<string, string | null> => {
  const { userAgent } = window.navigator;

  /**
   * Checks the browser's render engine based on the user-agent string.
   *
   * NOTE: Directly parsing the user-agent string can be unreliable.
   * For historical compatibility reasons, many user-agent strings include
   * keywords from other browsers or render engines (e.g., "Mozilla",
   * "like Gecko", "AppleWebKit"). This was to ensure that websites built
   * for a specific engine would still work on other browsers.
   *
   * Therefore, a simple search for a keyword like "Gecko" might give a
   * false positive, even though the browser actually uses a different engine
   * like Blink (Chrome) or WebKit (Safari). For robust detection, using a
   * specialized library like UAParser.js is recommended.
   *
   * find out more https://dev.to/saadnoorsalehin/all-you-need-to-know-about-browser-s-user-agent-string-5fe6
  */
  const getRenderingEngine = (): string | null => {
    if (userAgent.includes("Gecko/")) {
      return "Gecko";
    } else if (userAgent.includes("AppleWebKit/")) {
      return userAgent.includes("KHTML, like Gecko") ? "Blink" : "WebKit";
    }
    return null;
  };

  /**
   * Manually parses a globally defined `userAgent` string to determine the browser's
   * name and version.
   *
   * The function works by sequentially testing the `userAgent` string against a series
   * of regular expressions. Each expression is designed to match a unique signature
   * found in a specific browser's user agent string (e.g., "Edg/" for Edge, "OPR/" for Opera).
   *
   * When a match is found, the function immediately returns an object containing the
   * browser's name and its captured version number. If no patterns match after all
   * checks, it returns an object with null values.
   *
   * *IMPORTANT: The order of the `if` conditions is critical for accuracy.*
   * Many modern browsers include keywords from other browsers in their user agent,
   * as explained above, for compatibility reasons. For example:
   * - The user agent for Edge and Opera contains "Chrome".
   * - The user agent for Chrome contains "Safari".
   *
   * To prevent misidentification, the checks must be ordered from most specific to
   * most general. The check for Edge must come before Chrome, otherwise Edge would be
   * incorrectly identified as Chrome. Likewise, Chrome must be checked before Safari.
   *
   * @returns An object with two properties: `browserName` (string | null) and
   * containing the browser's name and version, or null if not detected.
  */
  const getBrowserDetails = (): BrowserDetails | undefined => {
    let match;

    if ((match = (userAgent.match(/OPR\/([\d.]+)/) || userAgent.match(/Opera\/([\d.]+)/)))) {
      return { browserName: "Opera", browserVersion: match[1] };
    }

    if ((match = (userAgent.match(/Edg\/([\d.]+)/) || userAgent.match(/Edge\/([\d.]+)/)))) {
      return { browserName: "Edge", browserVersion: match[1] };
    }

    if ((match = userAgent.match(/Chrome\/([\d.]+)/))) {
      return { browserName: "Chrome", browserVersion: match[1] };
    }

    if ((match = userAgent.match(/Version\/([\d.]+).*Safari/))) {
      return { browserName: "Safari", browserVersion: match[1] };
    }

    if ((match = userAgent.match(/Firefox\/([\d.]+)/))) {
      return { browserName: "Firefox", browserVersion: match[1] };
    }
    return undefined;
  };

  const getOS = (): string | null => {
    const osMatch = userAgent.match(/\(([^)]+)\)/);
    return osMatch?.[1] ? osMatch[1].split("; ")[0] : null;
  };

  const getDeviceType = (): "mobile" | "tablet" | "desktop" => {
    if (userAgent.toLowerCase().includes("mobi")) {
      return "mobile";
    } else if (userAgent.toLowerCase().includes("tablet")) {
      return "tablet";
    }
    return "desktop";
  };

  const renderingEngine = getRenderingEngine();
  const browserDetails = getBrowserDetails();
  const os = getOS();
  const deviceType = getDeviceType();

  return {
    renderingEngine,
    ...(browserDetails ? {
      browserName: browserDetails.browserName,
      browserVersion: browserDetails.browserVersion,
    } : {}),
    os,
    deviceType,
  };
};

const browserPlugin: TelemetryDeckReactSDKPlugin = (next: PayloadEnhancer) => (payload: Record<string, unknown>) => {
  // eslint-disable-next-line callback-return
  const enhancedPayload = next(payload);

  return {
    ...enhancedPayload,
    ...getBrowserInfo(),
  };
};

export { browserPlugin };
