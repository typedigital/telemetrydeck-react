declare module "@telemetrydeck/sdk" {
    type Method = string;
    type Payload = Record<string, string | number | boolean>;
    type Options = { target?: string, app?: string, user?: string };

    export class TelemetryDeck {
      constructor(options?: Options);
      async ingest(queue: [Method, Payload?][]): void;
      app(appId: string): void;
      user(identifier: string): void;
      async signal(payload?: Payload): Promise<Response>;
      push(tuple: [Method, Payload?] = []): Promise<void>;
    }
}
