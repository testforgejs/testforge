import { ERROR_PREFIX } from "../../constants/constants.js";

/**
 * Validates the default options factory for a plugin.
 *
 * Plugin preset defaults must be provided as factory functions.
 *
 * @param pluginName - The name of the plugin being validated.
 * @param value - The plugin's default options factory.
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
