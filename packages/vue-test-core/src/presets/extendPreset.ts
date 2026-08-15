import { validatePresetExtension } from "./validators/validatePresetExtension.js";
import type { PluginConfigDefaults, PresetDefinition, PresetExtension } from "../types";

/*
 * Extends a base preset with project-specific configuration.
 *
 * Extension rules:
 * - existing plugins in the manifest keep their module and receive the
 *   extension's `enabled` value;
 * - new plugins are added to the manifest;
 * - every plugin introduced by the extension must have a corresponding
 *   defaults entry;
 * - plugin defaults replace the base configuration entirely;
 * - plugin defaults are never deep-merged;
 * - `false` is not allowed in preset defaults; use runtime configuration
 *   to disable a plugin.
 *
 * The base preset is not mutated.
 */
export function extendPreset(
  basePreset: PresetDefinition,
  extension: PresetExtension,
): PresetDefinition {
  // Calling the isolated validation layer
  validatePresetExtension(basePreset, extension);

  // Immutable copying of basic structures
  const manifest = basePreset.manifest.map((entry) => ({ ...entry }));
  const defaults: PluginConfigDefaults = { ...basePreset.defaults };

  // Index for comparing plugins (by name/module contract link)
  const manifestByName = new Map(manifest.map((entry) => [entry.module.getName(), entry]));
  const extensionManifest = extension.manifest ?? [];

  // Manifest processing
  for (const entry of extensionManifest) {
    const pluginName = entry.module.getName();
    const existingEntry = manifestByName.get(pluginName);

    if (existingEntry) {
      if (entry.enabled !== undefined) {
        existingEntry.enabled = entry.enabled;
      }
    } else {
      // New module -> add (the presence of defaults is guaranteed by the validator above)
      manifest.push({
        module: entry.module,
        enabled: entry.enabled!,
      });
      manifestByName.set(pluginName, manifest[manifest.length - 1]);
    }
  }

  // Processing defaults
  if (extension.defaults) {
    for (const [pluginName, pluginDefaults] of Object.entries(extension.defaults)) {
      // The configuration completely replaces the parent configuration, without a deep merge
      defaults[pluginName] = pluginDefaults;
    }
  }

  return {
    manifest,
    defaults,
  };
}
