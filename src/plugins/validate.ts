/* eslint-disable max-len */

/**
 * Validates a plugin at runtime to ensure it conforms to the functional decorator pattern.
 *
 * @remarks
 * This function is primarily a safeguard for JavaScript users who do not get
 * compile-time checks from TypeScript. It performs a series of checks:
 * 1. The input must be a function.
 * 2. It warns if the function does not accept exactly one argument, as a
 * decorator is expected to receive the `next` enhancer.
 *
 * If the most critical check (is it a function?) fails, it will throw an `Error`
 * with a descriptive message.
 *
 * @param plugin - The plugin to validate. The type is `unknown` to allow for
 * validation of any input.
 * @param index - The index of the plugin in the plugins array, used for creating
 * a more descriptive error message.
 * @throws If the plugin is not a function.
 */
export function validatePlugin(plugin: unknown, index: number): void {
  // Check if the input is a function. This is the most critical check.
  if (typeof plugin !== "function") {
    throw new Error(`Invalid plugin at index ${index}: A plugin must be a function (decorator), but received type "${typeof plugin}".`);
  }

  // Check the function's number of expected arguments.
  // A valid decorator should accept exactly one argument `next`.
  // We use a warning instead of an error to be less strict, as some advanced
  // patterns (like using ...args) might affect the `length` property.
  if (plugin.length !== 1) {
    // Using console.warn provides helpful feedback without crashing the application.
    // eslint-disable-next-line no-console
    console.warn(`
      Warning for plugin at index ${index}: A plugin decorator should ideally accept exactly one argument ('next').
      This function expects ${plugin.length}, which might lead to unexpected behavior.
    `);
  }
}

export default validatePlugin;
