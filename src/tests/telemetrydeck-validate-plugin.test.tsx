/* eslint-disable max-len */

import validatePlugin from "../plugins/validate";

describe("validatePlugin", () => {
  describe("Given a correctly configured plugin object", () => {
    it("when validatePlugin is called, then it should not throw any error", () => {
      const validPlugin = {
        name: "My Valid Plugin",
        getPluginPayload: () => ({ success: true }),
      };

      expect(() => validatePlugin(validPlugin)).not.toThrow();
    });
  });

  describe("Given an invalid input for the plugin", () => {
    it("when the input is null, then it should throw an error indicating a plugin object is required", () => {
      const input = null;
      expect(() => validatePlugin(input)).toThrow("Invalid input: A plugin must be provided as an object.");
    });

    it("when the input is an array, then it should throw an error indicating a plugin object is required", () => {
      const input: [] = [];
      expect(() => validatePlugin(input)).toThrow("Invalid input: A plugin must be provided as an object.");
    });

    it("when the input is a primitive type like a number, then it should throw an error indicating a plugin object is required", () => {
      const input = 123;
      expect(() => validatePlugin(input)).toThrow("Invalid input: A plugin must be provided as an object.");
    });
  });

  describe("Given a plugin with an invalid 'name' property", () => {
    it("when the 'name' property is missing, then it should throw an error requiring a non-empty string", () => {
      const pluginWithoutName = { getPluginPayload: () => ({}) };
      expect(() => validatePlugin(pluginWithoutName)).toThrow("Invalid plugin: The \"name\" property must be a non-empty string.");
    });

    it("when the 'name' property is not a string, then it should throw an error requiring a non-empty string", () => {
      const pluginWithInvalidName = { name: 42, getPluginPayload: () => ({}) };
      expect(() => validatePlugin(pluginWithInvalidName)).toThrow("Invalid plugin: The \"name\" property must be a non-empty string.");
    });

    it("when the 'name' property is an empty or whitespace string, then it should throw an error requiring a non-empty string", () => {
      const pluginWithEmptyName = { name: "  ", getPluginPayload: () => ({}) };
      expect(() => validatePlugin(pluginWithEmptyName)).toThrow("Invalid plugin: The \"name\" property must be a non-empty string.");
    });
  });

  describe("Given a plugin with an invalid 'getPluginPayload' property", () => {
    it("when 'getPluginPayload' is missing, then it should throw an error indicating it must be a function", () => {
      const pluginWithoutPayloadFunc = { name: "Test Plugin" };
      expect(() => validatePlugin(pluginWithoutPayloadFunc)).toThrow("Invalid plugin \"Test Plugin\": The \"getPluginPayload\" property must be a function.");
    });

    it("when 'getPluginPayload' is not a function, then it should throw an error indicating it must be a function", () => {
      const pluginWithInvalidPayloadFunc = { name: "Test Plugin", getPluginPayload: "not a function" };
      expect(() => validatePlugin(pluginWithInvalidPayloadFunc)).toThrow("Invalid plugin \"Test Plugin\": The \"getPluginPayload\" property must be a function.");
    });
  });

  describe("Given a plugin whose 'getPluginPayload' function has runtime issues", () => {
    it("when the function throws an error on execution, then it should throw a specific error about the execution failure", () => {
      const throwingPlugin = {
        name: "Crashing Plugin",
        getPluginPayload: () => {
          throw new Error("Execution failed");
        },
      };
      expect(() => validatePlugin(throwingPlugin)).toThrow("Invalid plugin \"Crashing Plugin\": The \"getPluginPayload\" function threw an error during execution: Execution failed");
    });

    it("when the function returns null, then it should throw an error indicating an object was expected", () => {
      const pluginReturnsNull = {
        name: "Null Returner",
        getPluginPayload: () => null,
      };
      expect(() => validatePlugin(pluginReturnsNull)).toThrow("Invalid plugin \"Null Returner\": The \"getPluginPayload\" function did not return an object.");
    });

    it("when the function returns a primitive type, then it should throw an error indicating an object was expected", () => {
      const pluginReturnsString = {
        name: "String Returner",
        getPluginPayload: () => "I am not an object",
      };
      expect(() => validatePlugin(pluginReturnsString)).toThrow("Invalid plugin \"String Returner\": The \"getPluginPayload\" function did not return an object.");
    });
  });
});
