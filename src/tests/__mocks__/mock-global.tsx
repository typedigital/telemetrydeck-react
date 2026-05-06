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

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
