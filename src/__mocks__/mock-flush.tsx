import TelemetryDeck from "@telemetrydeck/sdk";

const mockFlush = jest.fn().mockImplementation(
  async (td: TelemetryDeck) => {
    await td.flush();
  },
);

export default mockFlush;
