// Funktion zur Extraktion von Browserinformationen aus dem User-Agent-String
const getBrowserInfo = (): Record<string, string | null> => {
  const { userAgent } = window.navigator;

  const getRenderingEngine = (): string | null => {
    if (userAgent.includes("Gecko/")) {
      return "Gecko";
    } else if (userAgent.includes("AppleWebKit/")) {
      return userAgent.includes("KHTML, like Gecko") ? "Blink" : "WebKit";
    }
    return null;
  };

  const getBrowserDetails = () => {
    if (userAgent.includes("Firefox/")) {
      return {
        browserName: "Firefox",
        browserVersion: userAgent.substring(userAgent.indexOf("Firefox/") + 8),
      };
    } else if (userAgent.includes("Chrome/")) {
      return {
        browserName: "Chrome",
        browserVersion: userAgent.substring(userAgent.indexOf("Chrome/") + 7).split(" ")[0],
      };
    } else if (userAgent.includes("Safari/") && !userAgent.includes("Chrome/")) {
      const version = userAgent.includes("Version/") ?
        userAgent.substring(userAgent.indexOf("Version/") + 8).split(" ")[0]
        : userAgent.substring(userAgent.indexOf("Safari/") + 7).split(" ")[0];
      return {
        browserName: "Safari",
        browserVersion: version,
      };
    } else if (userAgent.includes("Opera") || userAgent.includes("OPR/")) {
      const version = userAgent.includes("OPR/") ?
        userAgent.substring(userAgent.indexOf("OPR/") + 4).split(" ")[0]
        : userAgent.substring(userAgent.indexOf("Opera/") + 6).split(" ")[0];
      return {
        browserName: "Opera",
        browserVersion: version,
      };
    } else if (userAgent.includes("Edge/")) {
      return {
        browserName: "Edge",
        browserVersion: userAgent.substring(userAgent.indexOf("Edge/") + 5).split(" ")[0],
      };
    }
    return { browserName: null, browserVersion: null };
  };

  const getOS = (): string | null => {
    const osMatch = userAgent.match(/\(([^)]+)\)/);
    return osMatch?.[1] ? osMatch[1].split("; ")[0] : null;
  };

  const getDeviceType = (): string => {
    if (userAgent.toLowerCase().includes("mobi")) {
      return "mobile";
    } else if (userAgent.toLowerCase().includes("tablet")) {
      return "tablet";
    }
    return "desktop";
  };

  const renderingEngine = getRenderingEngine();
  const { browserName, browserVersion } = getBrowserDetails();
  const os = getOS();
  const deviceType = getDeviceType();

  return {
    renderingEngine,
    browserName,
    browserVersion,
    os,
    deviceType,
  };
};

const browserPlugin = (): Record<string, unknown> => {
  const deviceInfo = getBrowserInfo();
  return deviceInfo;
};

export default browserPlugin;
