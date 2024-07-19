/* eslint-disable import/no-unassigned-import */
/* eslint-disable import/extensions */
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import "cross-fetch/polyfill";
import "./__mocks__/mock-global";
import mockSignal from "./__mocks__/mock-signal";
import Setup from "./test-utils/setup-td";
import mockQueue from "./__mocks__/mock-queue";
import { createTelemetryDeck } from "./create-telemetrydeck";

const type = "pagewiev";
const component = "dashboard";
const path = "/dashboard";

test("signals are sent when pressing the button", () => {
  const td = createTelemetryDeck({ appID: "123456789", clientUser: "anonymous" });
  render(
    <Setup td={td}>
      <button
        type='button'
        onClick={async () => {
          await mockSignal(td, type, { component, path });
        }}
      >
        send signal
      </button>
    </Setup>,
  );
  const sendSignal = screen.getByRole("button", { name: "send signal" });
  expect(mockSignal).toHaveBeenCalledTimes(0);

  fireEvent.click(sendSignal);
  expect(mockSignal).toHaveBeenCalledTimes(1);
  expect(mockSignal).toHaveReturnedWith(td.signal(type, { component, path }));
});

test("signal is added to the queue when pressing the button", () => {
  const td = createTelemetryDeck({ appID: "123456789", clientUser: "anonymous" });
  render(
    <Setup td={td}>
      <button
        type='button'
        onClick={async () => {
          await mockQueue(td, type, { component, path });
        }}
      >
        add to queue
      </button>
    </Setup>,
  );
  const addToQueue = screen.getByRole("button", { name: "add to queue" });
  expect(mockQueue).toHaveBeenCalledTimes(0);

  fireEvent.click(addToQueue);
  expect(mockQueue).toHaveBeenCalledTimes(1);
  expect(mockQueue).toHaveReturnedWith(td.queue(type, { component, path }));
});
