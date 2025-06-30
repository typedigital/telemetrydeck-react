/* eslint-disable import/no-unassigned-import */
/* eslint-disable import/extensions */
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import "cross-fetch/polyfill";
import "./__mocks__/mock-global";
import { createTelemetryDeck } from "../create-telemetrydeck";
import Setup from "./test-utils/setup-td";
import { appID } from "./test-utils/variables";

const type = "pagewiev";
const component = "dashboard";
const path = "/dashboard";

test("signals are sent when pressing the button", () => {
  const td = createTelemetryDeck({ appID, clientUser: "anonymous" });
  const spy = jest.spyOn(td, "signal");
  render(
    <Setup td={td}>
      <button
        type='button'
        onClick={async () => {
          await td.signal(type, { component, path });
        }}
      >
        send signal
      </button>
    </Setup>,
  );
  const sendSignal = screen.getByRole("button", { name: "send signal" });
  expect(spy).toHaveBeenCalledTimes(0);

  fireEvent.click(sendSignal);
  expect(spy).toHaveBeenCalledTimes(1);
});

test("signal is added to the queue when pressing the button", () => {
  const td = createTelemetryDeck({ appID, clientUser: "anonymous" });
  const spy = jest.spyOn(td, "queue");
  render(
    <Setup td={td}>
      <button
        type='button'
        onClick={async () => {
          await td.queue(type, { component, path });
        }}
      >
        add to queue
      </button>
    </Setup>,
  );
  const addToQueue = screen.getByRole("button", { name: "add to queue" });
  expect(spy).toHaveBeenCalledTimes(0);

  fireEvent.click(addToQueue);
  expect(spy).toHaveBeenCalledTimes(1);
});
