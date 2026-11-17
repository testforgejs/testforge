import { validatePresetExtension } from "./validators/validatePresetExtension.js";
import type { PluginConfigDefaults, PresetDefinition, PresetExtension } from "../types.js";

/**
 * Creates a new preset by extending an existing preset definition.
 *
 * Combines the base preset with additional manifest entries and
 * default-options factories without mutating the base preset.
 *
 * Existing manifest entries retain their plugin modules and may have
 * their enabled state updated. New plugins are added to the manifest
 * and must provide a corresponding default-options factory.
 *
 * Default-options factories supplied by the extension replace existing
 * factories by plugin name. Their returned options are not automatically
 * merged with the base configuration.
 *
 * Preset defaults must be factory functions; values such as `false`
 * are not allowed. Use the manifest's `enabled` flag or runtime
 * plugin configuration to control plugin activation.
 *
 * Preset extension is a composition operation, not a runtime
 * configuration overlay.
 *
 * @param basePreset - The preset definition to extend.
 * @param extension - Manifest changes and default-options factories
 * to apply to the base preset.
 *
 * @returns A new preset definition with the combined manifest and
 * default-options factories.
 *
 * @throws {Error} If the base preset or extension is missing, the extension
 * contains duplicate plugin names, a new plugin lacks required settings,
 * or plugin defaults are invalid or reference undeclared plugins.
 *
 * @example
 * ```typescript
 * import { extendPreset } from "@testforgejs/vue-test-core";
 * import { presets as recommendedPresets } from "@testforgejs/vue-test-preset-recommended";
 * import { PLUGIN_NAME as I18N_PLUGIN_NAME } from "@testforgejs/vue-test-plugin-i18n";
 *
 * const projectPreset = extendPreset(recommendedPresets.default, {
 *   defaults: {
 *     [I18N_PLUGIN_NAME]: () => ({
 *       legacy: false,
 *       globalInjection: true,
 *       locale: "uk",
 *     }),
 *   },
 * });
 * ```
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
