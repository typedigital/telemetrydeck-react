/* eslint-disable max-len */

/**
 * Validates a plugin at runtime to ensure it conforms to either:
 * 1. The functional decorator pattern (backward-compatible): `(next) => (payload) => enhanced`
 * 2. The object plugin pattern: `{ enhance?, setup? }`
 *
 * @remarks
 * This function is primarily a safeguard for JavaScript users who do not get
 * compile-time checks from TypeScript.
 *
 * @param plugin - The plugin to validate. The type is `unknown` to allow for
 * validation of any input.
 * @param index - The index of the plugin in the plugins array, used for creating
 * a more descriptive error message.
 * @throws If the plugin is not a valid function or object plugin.
 */
export function validatePlugin(plugin: unknown, index: number): void {
  if (typeof plugin === "function") {
    if (plugin.length !== 1) {
      // eslint-disable-next-line no-console
      console.warn(`
      Warning for plugin at index ${index}: A plugin decorator should ideally accept exactly one argument ('next').
      This function expects ${plugin.length}, which might lead to unexpected behavior.
    `);
    }
    return;
  }

  if (typeof plugin === "object" && plugin !== null) {
    const obj = plugin as Record<string, unknown>;
    if (obj.enhance && typeof obj.enhance !== "function") {
      throw new Error(`Invalid plugin at index ${index}: 'enhance' must be a function (decorator).`);
    }
    if (obj.setup && typeof obj.setup !== "function") {
      throw new Error(`Invalid plugin at index ${index}: 'setup' must be a function.`);
    }
    if (!obj.enhance && !obj.setup) {
      throw new Error(`Invalid plugin at index ${index}: An object plugin must have at least an 'enhance' or 'setup' property.`);
    }
    return;
  }

  throw new Error(`Invalid plugin at index ${index}: A plugin must be a function (decorator) or an object with 'enhance' and/or 'setup', but received type "${typeof plugin}".`);
}

export default validatePlugin;
