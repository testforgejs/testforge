import { ERROR_PREFIX } from "../../constants/constants.js";
import { isPlainObject } from "../../guards/isPlainObject.js";

import type { PresetDefinition, PluginName, PluginManifestEntry } from "../../types.js";

/**
 * Validates a preset definition and narrows its type on success.
 *
 * Ensures that:
 * - the preset is a plain object;
 * - `manifest` is an array with unique plugin names;
 * - each manifest entry has a plugin module exposing `getName()`
 *   and `getDefinition()` methods, and a boolean `enabled` flag;
 * - `defaults` is a plain object;
 * - each defaults key corresponds to a plugin declared in the manifest;
 * - each default configuration is provided as an options factory function.
 *
 * Default-options factories are not invoked or their returned values validated.
 *
 * @param name - The preset name used to identify validation errors.
 * @param preset - The value to validate as a preset definition.
 *
 * @throws {Error} If the preset violates the validation rules.
 */
export function validatePreset(name: string, preset: unknown): asserts preset is PresetDefinition {
  if (!preset) {
    throw new Error(`${ERROR_PREFIX} Preset "${name}" is null or undefined.`);
  }

  if (!isPlainObject(preset)) {
    throw new Error(`${ERROR_PREFIX} Preset "${name}" must be a plain object.`);
  }

  const manifest = preset.manifest;

  if (!Array.isArray(manifest)) {
    throw new Error(`${ERROR_PREFIX} Preset "${name}" must have a "manifest" array.`);
  }

  const manifestPluginNames = new Set<PluginName>();

  // Validate manifest structure and uniqueness
  manifest.forEach((entry: unknown, index: number) => {
    if (entry === null || typeof entry !== "object" || Array.isArray(entry)) {
      throw new Error(
        `${ERROR_PREFIX} Invalid manifest entry at manifest[${index}] in preset "${name}".`,
      );
    }

    const { module, enabled } = entry as Partial<PluginManifestEntry>;

    if (
      !module ||
      typeof module.getName !== "function" ||
      typeof module.getDefinition !== "function"
    ) {
      throw new Error(`${ERROR_PREFIX} Invalid module at manifest[${index}] in preset "${name}".`);
    }

    const pluginName = module.getName();
    if (manifestPluginNames.has(pluginName)) {
      throw new Error(
        `${ERROR_PREFIX} Duplicate plugin "${pluginName}" in manifest of preset "${name}".`,
      );
    }

    if (typeof enabled !== "boolean") {
      throw new Error(
        `${ERROR_PREFIX} Plugin "${pluginName}" in preset "${name}" must have a boolean "enabled" flag.`,
      );
    }

    manifestPluginNames.add(pluginName);
  });

  const defaults = preset.defaults;

  // Validate plugin defaults against manifest declarations
  if (!isPlainObject(defaults)) {
    throw new Error(`${ERROR_PREFIX} Preset "${name}" must have a "defaults" plain object.`);
  }

  const defaultKeys = Object.keys(defaults);

  defaultKeys.forEach((key) => {
    if (!manifestPluginNames.has(key)) {
      throw new Error(
        `${ERROR_PREFIX} Preset "${name}" contains defaults for unknown plugin "${key}". ` +
          `This plugin is not present in the manifest.`,
      );
    }

    const value = defaults[key];

    if (typeof value !== "function") {
      throw new Error(
        `${ERROR_PREFIX} Invalid default configuration for plugin "${key}" in preset "${name}". ` +
          `Expected a plugin options factory function, but received ${typeof value}.`,
      );
    }
  });
}
