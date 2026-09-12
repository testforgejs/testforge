import { ERROR_PREFIX } from "../../constants/constants.js";
import { isPlainObject } from "../../guards/isPlainObject.js";

import type { PresetDefinition, PluginName, PluginManifestEntry } from "../../types";

/*
 * Validates preset integrity and plugin configuration consistency.
 *
 * Validation rules:
 * - preset must be a plain object
 * - manifest must be an array
 * - manifest must contain unique plugin entries
 * - every plugin entry must define a valid module and enabled flag
 * - defaults must be a plain object when provided
 * - preset defaults may only target plugins declared in the manifest
 * - plugin defaults must be option factory functions
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
  manifest.forEach((entry: PluginManifestEntry, index: number) => {
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
