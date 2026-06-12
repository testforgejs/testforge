import { ERROR_PREFIX } from "../constants/constants.js";

import type { PresetDefinition, PluginName, PluginManifestEntry } from "../types";

/*
 * Validates preset integrity and plugin configuration consistency.
 *
 * Validation rules:
 * - manifest must contain unique plugin entries
 * - every plugin entry must define a valid module and enabled flag
 * - preset defaults may only target plugins declared in the manifest
 * - plugin defaults must be plain configuration objects
 */
export function validatePreset(name: PluginName, preset: PresetDefinition): void {
  if (!preset) {
    throw new Error(`${ERROR_PREFIX} Preset "${name}" is null or undefined.`);
  }

  if (!Array.isArray(preset.manifest)) {
    throw new Error(`${ERROR_PREFIX} Preset "${name}" must have a "manifest" array.`);
  }

  const manifestPluginNames = new Set<PluginName>();

  // Validate manifest structure and uniqueness
  preset.manifest.forEach((entry: PluginManifestEntry, index: number) => {
    const { module, enabled } = entry;

    if (!module || typeof module.getName !== "function") {
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

  // Validate plugin defaults against manifest declarations
  if (preset.defaults) {
    const defaultKeys = Object.keys(preset.defaults);

    defaultKeys.forEach((key) => {
      if (!manifestPluginNames.has(key)) {
        throw new Error(
          `${ERROR_PREFIX} Preset "${name}" contains defaults for unknown plugin "${key}". ` +
            `This plugin is not present in the manifest.`,
        );
      }

      const value = preset.defaults[key];
      const isObject = value !== null && typeof value === "object" && !Array.isArray(value);

      if (!isObject) {
        throw new Error(
          `${ERROR_PREFIX} Invalid default configuration for plugin "${key}" in preset "${name}". ` +
            `Expected Object, but received ${typeof value}.`,
        );
      }
    });
  }
}
