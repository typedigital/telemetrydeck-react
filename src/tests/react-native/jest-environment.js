/* eslint-disable global-require */
/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");

const NodeEnvironment = require(
  path.resolve(__dirname, "../../../node_modules/tsdx/node_modules/jest-environment-node"),
);

/**
 * Custom Jest environment for React Native plugin tests.
 * Uses Node environment (no DOM) with polyfills needed by @telemetrydeck/sdk.
 * The react-native module itself is provided via jest.mock({ virtual: true }) in each test file.
 */
class ReactNativeEnvironment extends NodeEnvironment {
  async setup() {
    await super.setup();

    // Provide crypto.subtle for @telemetrydeck/sdk hashing
    const crypto = require("crypto");
    this.global.crypto = {
      ...crypto,
      subtle: {
        digest: () => new Uint8Array(16),
      },
    };

    // Provide TextEncoder (needed by SDK)
    const { TextEncoder } = require("util");
    this.global.TextEncoder = TextEncoder;
  }
}

module.exports = ReactNativeEnvironment;
