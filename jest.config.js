const path = require("path");

const tsJestTransform = path.resolve(__dirname, "node_modules/tsdx/node_modules/ts-jest/dist");

module.exports = {
  projects: [
    {
      displayName: "web",
      rootDir: __dirname,
      testEnvironment: "jsdom",
      testMatch: [
        "<rootDir>/src/tests/*.test.{ts,tsx}",
        "<rootDir>/src/tests/web/**/*.test.{ts,tsx}",
      ],
      transform: { ".(ts|tsx)$": tsJestTransform },
      moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
      globals: {
        "ts-jest": { tsConfig: "tsconfig.json" },
      },
    },
    {
      displayName: "react-native",
      rootDir: __dirname,
      testEnvironment: "<rootDir>/src/tests/react-native/jest-environment.js",
      testMatch: [
        "<rootDir>/src/tests/react-native/**/*.test.{ts,tsx}",
      ],
      moduleNameMapper: {
        "^react-native$": "<rootDir>/src/tests/react-native/__mocks__/react-native.js",
      },
      transform: { ".(ts|tsx)$": tsJestTransform },
      moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
      globals: {
        "ts-jest": { tsConfig: "tsconfig.json" },
      },
    },
  ],
};
