import crypto from "crypto";

Object.defineProperty(global, "crypto", {
  value: {
    ...crypto,
    subtle: {
      digest: jest.fn().mockImplementation(() => new Uint8Array(16)),
    },
  },
  writable: true,
});
