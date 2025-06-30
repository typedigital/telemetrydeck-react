/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable import/no-unassigned-import */
import React from "react";
import { fireEvent, render, screen, act } from "@testing-library/react";
import "cross-fetch/polyfill";
import "./__mocks__/mock-global";
import { setupServer } from "msw/node";
import { LIB_VERSION } from "../version";
import { createTelemetryDeck } from "../create-telemetrydeck";
import Setup from "./test-utils/setup-td";
import { handlers } from "./test-utils/handlers";
import { appID } from "./test-utils/variables";

const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const component = "dashboard";
const path = "/dashboard";

test("given a telemetryDeck, when envoking its signal function, the respective signal is sent", async () => {
  const td = createTelemetryDeck({ appID, clientUser: "anonymous" });

  let requestCount = 0;
  server.events.on("request:start", () => {
    requestCount += 1;
  });
  render(
    <Setup td={td}>
      <button
        type='button'
        onClick={async () => {
          const res = await td.signal("signal button click", { component, path });
          const jsonRes = await res.json();
          expect(jsonRes.username[0].appID).toBe(appID);
          expect(jsonRes.username[0].type).toBe("signal button click");
        }}
      >
        send signal
      </button>
    </Setup>,
  );
  const sendSignal = screen.getByRole("button", { name: "send signal" });
  expect(requestCount).toBe(0);

  await act(() => fireEvent.click(sendSignal));
  expect(requestCount).toBe(1);

  await act(() => fireEvent.click(sendSignal));
  expect(requestCount).toBe(2);
});

test("Given a telemetryDeck, when adding signals to the queue, then no request should be sent", async () => {
  const td = createTelemetryDeck({ appID, clientUser: "anonymous" });

  /**
   * This event listener is used to count the number of requests sent to the server.
   */
  let requestCount = 0;
  server.events.on("request:start", () => {
    requestCount += 1;
  });
  render(
    <Setup td={td}>
      <button
        type='button'
        onClick={async () => {
          await td.queue("queue button click", { ...{ component, path }, tdReactVersion: LIB_VERSION });
        }}
      >
        add to queue
      </button>
    </Setup>,
  );
  const addToQueue = screen.getByRole("button", { name: "add to queue" });
  expect(requestCount).toBe(0);

  await act(() => fireEvent.click(addToQueue));
  expect(requestCount).toBe(0);
});

test("Given signals are queued, when flushing, respective signals are sent together", async () => {
  const td = createTelemetryDeck({ appID, clientUser: "anonymous" });

  /**
   * This event listener is used to count the number of requests sent to the server.
   * sorted by signal type and queue type respectively.
   */
  let signalSendRequestCount = 0;
  let queueRequestCount = 0;
  server.events.on("request:start", (request) => {
    const body = request.body as { type: string }[];
    body.forEach((signal: { type: string }) => {
      if (signal.type === "signal button click") {
        signalSendRequestCount += 1;
      } else if (signal.type === "queue button click") {
        queueRequestCount += 1;
      }
    });
  });

  render(
    <Setup td={td}>
      <>
        <button
          type='button'
          onClick={async () => {
            await td.signal("signal button click", { component, path });
          }}
        >
          send signal
        </button>
        <button
          type='button'
          onClick={async () => {
            await td.queue("queue button click", { component, path });
          }}
        >
          add to queue
        </button>
        <button
          type='button'
          onClick={async () => {
            const res = await td.flush();
            const json = await res.json();
            expect(json.username.length).toBe(queueRequestCount);
          }}
        >
          flush queue
        </button>
      </>
    </Setup>,
  );
  const sendSignal = screen.getByRole("button", { name: "send signal" });
  const addToQueue = screen.getByRole("button", { name: "add to queue" });
  const flushQueue = screen.getByRole("button", { name: "flush queue" });
  expect(signalSendRequestCount).toBe(0);
  expect(queueRequestCount).toBe(0);

  await act(() => fireEvent.click(sendSignal));
  expect(signalSendRequestCount).toBe(1);
  expect(queueRequestCount).toBe(0);

  await act(() => fireEvent.click(addToQueue));
  expect(signalSendRequestCount).toBe(1);
  expect(queueRequestCount).toBe(0);

  await act(() => fireEvent.click(addToQueue));
  expect(signalSendRequestCount).toBe(1);
  expect(queueRequestCount).toBe(0);

  await act(() => fireEvent.click(flushQueue));
  expect(signalSendRequestCount).toBe(1);
  expect(queueRequestCount).toBe(2);
});

test("Given we queue up to 100, when flushing, then the system does not break", async () => {
  const td = createTelemetryDeck({ appID, clientUser: "anonymous" });

  /**
   * This event listener is used to count the number of requests sent to the server.
   */
  let queueRequestCount = 0;
  server.events.on("request:start", (request) => {
    const body = request.body as { type: string }[];
    body.forEach(() => {
      queueRequestCount += 1;
    });
  });

  render(
    <Setup td={td}>
      <>
        <button
          type='button'
          onClick={async () => {
            await td.queue("queue button click", { component, path });
          }}
        >
          add to queue
        </button>
        <button
          type='button'
          onClick={async () => {
            await td.flush();
          }}
        >
          flush queue
        </button>
      </>
    </Setup>,
  );
  const addToQueue = screen.getByRole("button", { name: "add to queue" });
  const flushQueue = screen.getByRole("button", { name: "flush queue" });
  expect(queueRequestCount).toBe(0);

  const itterations = 100;
  // eslint-disable-next-line @typescript-eslint/await-thenable, @typescript-eslint/no-confusing-void-expression
  await act(() => {
    for (let i = 0; i < itterations; i += 1) {
      fireEvent.click(addToQueue);
    }
  });
  expect(queueRequestCount).toBe(0);

  await act(() => fireEvent.click(flushQueue));
  expect(queueRequestCount).toBe(itterations);
});

test("Given no signals are queued, when flushing the Store, then the system does not break", async () => {
  const td = createTelemetryDeck({ appID, clientUser: "anonymous" });

  /**
   * This event listener is used to count the number of requests sent to the server.
   */
  let queueRequestCount = 0;
  server.events.on("request:start", (request) => {
    const body = request.body as { type: string }[];
    body.forEach(() => {
      queueRequestCount += 1;
    });
  });

  render(
    <Setup td={td}>
      <button
        type='button'
        onClick={async () => {
          await td.flush();
        }}
      >
        flush queue
      </button>
    </Setup>,
  );
  const flushQueue = screen.getByRole("button", { name: "flush queue" });

  await act(() => fireEvent.click(flushQueue));
  expect(queueRequestCount).toBe(0);
});
test("Given no appId was provided, when envoking createTelemetryDeck, then we expect our function to throw", () => {
  let error;
  try {
    // @ts-expect-error since we are testing an edge case where users using javaScript might pass undefined values
    createTelemetryDeck({ clientUser: "anonymous" });
  } catch (err) {
    error = err;
  }
  expect(error).toBeDefined();
});
