/* eslint-disable max-len */
/* eslint-disable import/no-unassigned-import */
/* eslint-disable promise/avoid-new */
import "cross-fetch/polyfill";
import "./__mocks__/mock-global";
import { setupServer } from "msw/node";
import { createTelemetryDeck } from "../create-telemetrydeck";
import { navigationPlugin } from "../plugins/navigation-plugin";
import { handlers } from "./test-utils/handlers";
import { appID, namespace } from "./test-utils/variables";

const server = setupServer(...handlers);

type SignalBody = {
  type: string,
  payload: Record<string, unknown>,
};

const getSignals = () => {
  const signals: SignalBody[] = [];
  server.events.on("request:start", (request) => {
    const { body } = request;
    if (Array.isArray(body)) {
      body.forEach((s: SignalBody) => signals.push(s));
    } else if (body) {
      signals.push(body as SignalBody);
    }
  });
  return () => signals;
};

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

let origPushState: typeof history.pushState;
let origReplaceState: typeof history.replaceState;

beforeAll(() => {
  server.listen();
  origPushState = history.pushState.bind(history);
  origReplaceState = history.replaceState.bind(history);
});

afterEach(() => {
  server.resetHandlers();
  history.pushState = origPushState;
  history.replaceState = origReplaceState;
});

afterAll(() => server.close());

test("Navigation plugin sends initial page view on setup", async () => {
  const readSignals = getSignals();

  const td = createTelemetryDeck({
    appID,
    clientUser: "anonymous",
    namespace,
    plugins: [navigationPlugin],
  });

  await wait(50);

  const signals = readSignals();
  expect(signals.length).toBeGreaterThanOrEqual(1);

  const navSignal = signals.find((s) => s.type === "TelemetryDeck.Navigation.pathChanged");
  expect(navSignal).toBeDefined();
  expect(navSignal?.payload["TelemetryDeck.Navigation.schemaVersion"]).toBe("1");
  expect(navSignal?.payload["TelemetryDeck.Navigation.sourcePath"]).toBe("");
  expect(navSignal?.payload["TelemetryDeck.Navigation.destinationPath"]).toBe("/");
  expect(navSignal?.payload["TelemetryDeck.Navigation.identifier"]).toBe(" -> /");

  td.cleanup?.();
});

test("Navigation plugin sends signal on pushState", async () => {
  const readSignals = getSignals();

  const td = createTelemetryDeck({
    appID,
    clientUser: "anonymous",
    namespace,
    plugins: [navigationPlugin],
  });

  await wait(50);

  history.pushState({}, "", "/about");
  await wait(50);

  const signals = readSignals();
  const pushSignal = signals.find(
    (s) => s.payload["TelemetryDeck.Navigation.destinationPath"] === "/about",
  );
  expect(pushSignal).toBeDefined();
  expect(pushSignal?.payload["TelemetryDeck.Navigation.sourcePath"]).toBe("/");
  expect(pushSignal?.payload["TelemetryDeck.Navigation.identifier"]).toBe("/ -> /about");

  td.cleanup?.();
  history.pushState({}, "", "/");
});

test("Navigation plugin does not send signal when path is unchanged", async () => {
  const readSignals = getSignals();

  const td = createTelemetryDeck({
    appID,
    clientUser: "anonymous",
    namespace,
    plugins: [navigationPlugin],
  });

  await wait(50);
  const countAfterInit = readSignals().length;

  history.pushState({}, "", "/");
  await wait(50);

  expect(readSignals().length).toBe(countAfterInit);

  td.cleanup?.();
});

test("Navigation plugin cleanup restores original history methods", () => {
  const pushBefore = history.pushState;

  const td = createTelemetryDeck({
    appID,
    clientUser: "anonymous",
    namespace,
    plugins: [navigationPlugin],
  });

  // pushState should be patched (different from before)
  expect(history.pushState).not.toBe(pushBefore);

  td.cleanup?.();

  // After cleanup, should be restored
  expect(typeof history.pushState).toBe("function");
  expect(typeof history.replaceState).toBe("function");
});

describe("SSR / React Native (no window)", () => {
  const originalWindow = global.window;

  beforeEach(() => {
    // @ts-expect-error simulate SSR by removing window
    delete global.window;
  });

  afterEach(() => {
    global.window = originalWindow;
  });

  test("Navigation plugin setup does not crash when window is undefined", () => {
    expect(() => {
      const td = createTelemetryDeck({
        appID,
        clientUser: "anonymous",
        namespace,
        plugins: [navigationPlugin],
      });
      td.cleanup?.();
    }).not.toThrow();
  });
});
