import { ERROR_PREFIX } from "../../constants/constants.js";
import { validatePluginDefaults } from "./validatePluginDefaults.js";
import type { PresetDefinition, PresetExtension } from "../../types.js";

/**
 * Validates a preset extension before applying it to a base preset.
 *
 * Ensures that:
 * - the base preset and extension are provided;
 * - plugin names in the extension manifest are unique;
 * - newly introduced plugins specify an initial enabled state;
 * - newly introduced plugins have corresponding default-options factories;
 * - preset defaults are factory functions rather than configuration objects
 *   or disabling values such as `false`;
 * - defaults reference only plugins declared in the base or extension manifest.
 *
 * Default-options factories are not invoked during validation.
 *
 * @param basePreset - The preset being extended.
 * @param extension - The manifest and default-configuration changes to validate.
 *
 * @throws {Error} If the extension violates the validation rules.
 */
export function validatePresetExtension(
  basePreset: PresetDefinition,
  extension: PresetExtension,
): void {
  if (!basePreset) {
    throw new Error(`${ERROR_PREFIX} Cannot extend a null or undefined preset.`);
  }
  if (!extension) {
    throw new Error(`${ERROR_PREFIX} Preset extension is null or undefined.`);
  }

  const basePluginNames = new Set(basePreset.manifest.map((entry) => entry.module.getName()));
  const extensionManifest = extension.manifest ?? [];

  const extensionManifestPlugins = new Set<string>();

  // 1. Validation of the extension manifest
  for (const entry of extensionManifest) {
    const pluginName = entry.module.getName();

    if (extensionManifestPlugins.has(pluginName)) {
      throw new Error(
        `${ERROR_PREFIX} Duplicate plugin "${pluginName}" in preset extension manifest.`,
      );
    }

    extensionManifestPlugins.add(pluginName);

    const isNewPlugin = !basePluginNames.has(pluginName);

    if (isNewPlugin) {
      if (entry.enabled === undefined) {
        throw new Error(
          `${ERROR_PREFIX} Cannot add plugin "${pluginName}" to an extended preset without specifying "enabled".`,
        );
      }

      const pluginDefaults = extension.defaults?.[pluginName];
      if (pluginDefaults === undefined) {
        throw new Error(
          `${ERROR_PREFIX} Cannot add plugin "${pluginName}" to an extended preset without defining its defaults.`,
        );
      }
    }
  }

  // 2. Validate extension defaults
  if (extension.defaults) {
    for (const [pluginName, pluginDefaults] of Object.entries(extension.defaults)) {
      validatePluginDefaults(pluginName, pluginDefaults);

      // Validation: Defaults can only be declared for plugins from the base preset OR those added in the current manifest
      const isKnownPlugin =
        basePluginNames.has(pluginName) || extensionManifestPlugins.has(pluginName);
      if (!isKnownPlugin) {
        throw new Error(
          `${ERROR_PREFIX} Cannot define defaults for unknown plugin "${pluginName}" ` +
            `in a preset extension. The plugin must be declared in the manifest.`,
        );
      }
    }
  }
}
