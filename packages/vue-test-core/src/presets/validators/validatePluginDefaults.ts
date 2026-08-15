import { ERROR_PREFIX } from "../../constants/constants.js";
import { isPlainObject } from "../../guards/isPlainObject.js";

/**
 * Validates the default configuration for a plugin.
 *
 * Plugin defaults must be plain objects. Primitive values, arrays,
 * class instances, and other non-plain objects are rejected.
 *
 * @param pluginName - The name of the plugin being validated.
 * @param value - The plugin's default configuration.
 * @throws {Error} If the value is not a plain object.
 */
export function validatePluginDefaults(pluginName: string, value: unknown): void {
  if (!isPlainObject(value)) {
    throw new Error(
      `${ERROR_PREFIX} Invalid defaults for plugin "${pluginName}". ` +
        `Preset defaults must be a plain object.`,
    );
  }
}
