declare module "@telemetrydeck/sdk" {
  declare class Store {
    private #data: any[];

    push(value: Promise<any>): void;
    clear(): void;
    values(): any[];
  }

  type Payload = Record<string, string | number | boolean>;
  type Options = {
    appID: string,
    clientUser: string,
    target?: string,
    sessionID?: string,
    salt?: string,
    testMode?: boolean,
    store?: Store,
  };

  class TelemetryDeck {
    appID: string;
    clientUser: string;
    salt: string;
    target: string;
    testMode: boolean;
    constructor(options?: Options);
    signal(
      type: string, payload?: Payload, options?: Options
    ): Promise<Response>;
    queue(
      type: string, payload?: Payload, options?: Options
    ): Promise<void>;
    flush(): Promise<Response>;
  }

  export { TelemetryDeck as default, Payload, Options };
}
