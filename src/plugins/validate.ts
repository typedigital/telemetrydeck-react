/* eslint-disable max-len */
/**
 * Validates a plugin object to ensure it conforms to the required structure.
 *
 * @remarks
 * This function performs a series of checks:
 * 1. The input must be a non-null object.
 * 2. It must have a `name` property that is a non-empty string.
 * 3. It must have a `getPluginPayload` property that is a function.
 * 4. The `getPluginPayload` function must execute without errors.
 * 5. The result of `getPluginPayload()` must be a non-null object.
 *
 * If any of these checks fail, the function will throw an `Error` with a
 * descriptive message.
 *
 * @param pluginObject - The plugin object to validate. The type is `unknown` to
 * allow for validation of any input.
 * @throws If the plugin object fails any validation check.
 */
export function validatePlugin(pluginObject: unknown): void {
  // 1. Check if the input is a non-null object.
  if (typeof pluginObject !== "object" || pluginObject === null || Array.isArray(pluginObject)) {
    throw new Error("Invalid input: A plugin must be provided as an object.");
  }

  // For easier access, we can now safely assert the type for internal use.
  const plugin = pluginObject as Record<string, unknown>;

  // 2. Check for the 'name' property and its type.
  if (typeof plugin.name !== "string" || plugin.name.trim() === "") {
    throw new Error("Invalid plugin: The \"name\" property must be a non-empty string.");
  }

  // 3. Check for the 'getPluginPayload' property and its type.
  if (typeof plugin.getPluginPayload !== "function") {
    throw new Error(`Invalid plugin "${plugin.name}": The "getPluginPayload" property must be a function.`);
  }

  // 4. Try to execute the `getPluginPayload` function.
  let payload: unknown;
  try {
    payload = plugin.getPluginPayload();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Invalid plugin "${plugin.name}": The "getPluginPayload" function threw an error during execution: ${errorMessage}`,
    );
  }

  // 5. Check if the result of the function is a valid object.
  if (typeof payload !== "object" || payload === null || Array.isArray(payload)) {
    throw new Error(
      `Invalid plugin "${plugin.name}": The "getPluginPayload" function did not return an object.`,
    );
  }
}

export default validatePlugin;
