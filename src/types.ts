import TelemetryDeck, { TelemetryDeckOptions } from "@telemetrydeck/sdk";
import { BrowserPlugin } from "./plugins";

type PayloadEnhancer = (payload: Record<string, unknown>) => Record<string, unknown>;

type TelemetryDeckReactSDKPlugin = {
  (next: PayloadEnhancer): PayloadEnhancer,
  name?: string,
};
type TelemetryDeckReactSDKOptions = TelemetryDeckOptions & {
  plugins?: TelemetryDeckReactSDKPlugin[],
};

type TelemetryDeckReactSDK = TelemetryDeck & {
  payloadEnhancer?: PayloadEnhancer,
};

type BaseOptions = Omit<TelemetryDeckReactSDKOptions, "appID" | "clientUser" | "plugins">;

type OptionsWithBrowserPlugin = BaseOptions & {
  appID: string,
  plugins: [BrowserPlugin, ...TelemetryDeckReactSDKPlugin[]] | [...TelemetryDeckReactSDKPlugin[], BrowserPlugin],
  clientUser?: string,
};

type OptionsWithRequiredUser = BaseOptions & {
  appID: string,
  plugins?: TelemetryDeckReactSDKPlugin[],
  clientUser: string,
};

export {
  PayloadEnhancer,
  TelemetryDeckReactSDKPlugin,
  TelemetryDeckReactSDKOptions,
  TelemetryDeckReactSDK,
  OptionsWithBrowserPlugin,
  OptionsWithRequiredUser,
};
