import { TelemetryDeckReactSDKPlugins } from "src/create-telemetrydeck";
import browserPlugin from "./browser-plugin";

const plugins: Record<TelemetryDeckReactSDKPlugins, () => Record<string, unknown>> = {
  browserPlugin,
};

export default plugins;
