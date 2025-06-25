/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-empty-function */
// telemetrydeck-validate-plugin.test.tsx

import { validatePlugin } from "../plugins/validate"; // Adjusted import path

describe("validatePlugin", () => {
  describe("Given a correctly configured functional plugin", () => {
    it("when the plugin is a function with one argument, then it should not throw any error", () => {
      const validPlugin = (next: unknown) => next;
      expect(() => validatePlugin(validPlugin, 0)).not.toThrow();
    });
  });

  describe("Given an invalid input type for the plugin", () => {
    it("when the input is an object, then it should throw an error that a function is required", () => {
      const input = { name: "I am an old plugin" };
      const index = 0;
      expect(() => validatePlugin(input, index)).toThrow();
    });

    it("when the input is null, then it should throw an error that a function is required", () => {
      const input = null;
      const index = 1;
      expect(() => validatePlugin(input, index)).toThrow();
    });

    it("when the input is a primitive type like a number, then it should throw an error that a function is required", () => {
      const input = 123;
      const index = 2;
      expect(() => validatePlugin(input, index)).toThrow();
    });
  });

  describe("Given a plugin that is a function but has an incorrect signature", () => {
    it("when the function accepts zero arguments, then it should throw an error", () => {
      const pluginWithNoArgs = () => {};
      const index = 0;
      expect(() => validatePlugin(pluginWithNoArgs, index)).toThrow();
    });

    it("when the function accepts more than one argument, then it should throw an error", () => {
      const pluginWithTwoArgs = (_a: unknown, _b: unknown) => {};
      const index = 1;
      expect(() => validatePlugin(pluginWithTwoArgs, index)).toThrow();
    });
  });
});
