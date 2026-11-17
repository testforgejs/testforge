import { ERROR_PREFIX } from "../../constants/constants.js";

/**
 * Validates that a plugin's preset defaults are provided as a factory function.
 *
 * Checks the factory itself without invoking it or validating
 * the options it returns.
 *
 * @param pluginName - The name of the plugin being validated.
 * @param value - The value expected to be a default-options factory.
 *
 * @throws {Error} If the value is not a function.
 */
export function validatePluginDefaults(pluginName: string, value: unknown): void {
  if (typeof value !== "function") {
    throw new Error(
      `${ERROR_PREFIX} Invalid defaults for plugin "${pluginName}". ` +
        `Preset defaults must be provided as a plugin options factory function.`,
    );
  }
}
