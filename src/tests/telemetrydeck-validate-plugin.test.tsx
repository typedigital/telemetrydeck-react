/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable max-len */
// telemetrydeck-validate-plugin.test.tsx

import { validatePlugin } from "../plugins/validate"; // Adjusted import path

describe("validatePlugin", () => {
  // Spy on console.warn to test for warnings without cluttering the output
  let consoleWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    // Mock console.warn before each test
    consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore the original console.warn after each test
    consoleWarnSpy.mockRestore();
  });

  describe("Given a correctly configured functional plugin", () => {
    it("when the plugin is a function with one argument, then it should not throw any error", () => {
      const validPlugin = (next: unknown) => next;
      expect(() => validatePlugin(validPlugin, 0)).not.toThrow();
    });

    it("when a valid plugin is validated, then it should not issue a warning", () => {
      const validPlugin = (next: unknown) => next;
      validatePlugin(validPlugin, 0);
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });

  describe("Given an invalid input type for the plugin", () => {
    it("when the input is an object, then it should throw an error that a function is required", () => {
      const input = { name: "I am an old plugin" };
      const index = 0;
      expect(() => validatePlugin(input, index)).toThrow();
    });

    // ... (other tests for invalid types remain the same) ...

    it("when the input is a primitive type like a number, then it should throw an error that a function is required", () => {
      const input = 123;
      const index = 2;
      expect(() => validatePlugin(input, index)).toThrow();
    });
  });

  describe("Given a plugin that is a function but has an incorrect signature", () => {
    it("when the function accepts zero arguments, then it should issue a console warning", () => {
      const pluginWithNoArgs = () => {};
      const index = 0;
      validatePlugin(pluginWithNoArgs, index);

      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
    });

    it("when the function accepts more than one argument, then it should issue a console warning", () => {
      const pluginWithTwoArgs = (_a: unknown, _b: unknown) => {};
      const index = 1;
      validatePlugin(pluginWithTwoArgs, index);

      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
    });

    it("when the function has an incorrect signature, it should not throw an error", () => {
      const pluginWithTwoArgs = (_a: unknown, _b: unknown) => {};
      expect(() => validatePlugin(pluginWithTwoArgs, 0)).not.toThrow();
    });
  });
});
