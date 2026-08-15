import { ERROR_PREFIX } from "../../constants/constants.js";
import { validatePluginDefaults } from "./validatePluginDefaults.js";
import type { PresetDefinition, PresetExtension } from "../../types";

/**
 * Validates the preset extension before applying it to the base preset.
 *
 * Checks for compliance with the following architectural rules:
 * - The base preset and the extension must be specified (not null/undefined).
 * - If a new plugin (not present in the base preset) is passed to the extension,
 *   the `enabled` parameter must be specified for it in the manifest.
 * - The new plugin must have corresponding default settings in the `defaults` section of the manifest; otherwise, an error is thrown.
 * - The value `false` in the `defaults` section is strictly prohibited (use `enabled: false` in the manifest to disable the plugin).
 * - The `defaults` section may only contain configuration for plugins declared either in the base preset or in the extension manifest being added.
 *
 * @param {PresetDefinition} basePreset - The base preset to be extended.
 * @param {PresetExtension} extension - An object containing modifications and additions to the preset.
 * @throws {Error} Throws an error if any of the validation rules are violated.
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
