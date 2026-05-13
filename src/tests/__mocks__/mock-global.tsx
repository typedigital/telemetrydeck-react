import crypto from "crypto";
import { TextEncoder } from "util";

global.TextEncoder = TextEncoder as typeof globalThis.TextEncoder;

Object.defineProperty(global, "crypto", {
  value: {
    ...crypto,
    subtle: {
      digest: jest.fn().mockImplementation(() => new Uint8Array(16)),
    },
  },
  writable: true,
});
