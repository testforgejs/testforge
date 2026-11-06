import { assertUnsupportedPlugins } from "./assertUnsupportedPlugins.js";
import { resolvePresetKey } from "../presets/resolvePresetKey.js";

import type { ComponentFactoryOptions, PresetKey, TestFrameworkPresets } from "../types.js";

/*
 * Validates factory-default plugin configuration against the
 * factory's preset, including the implicit "default" preset.
 *
 * Preset existence is validated separately. If the selected preset
 * is not registered, this validator does not perform manifest checks.
 *
 * A mount-level preset override does not change which preset
 * validates the factory's own defaults.
 */
export function validateFactoryPresetPlugins(
  defaultMountOptions: ComponentFactoryOptions,
  presetKey: PresetKey | undefined,
  presets: TestFrameworkPresets,
): void {
  const configuredPlugins = defaultMountOptions.plugins;

  if (!configuredPlugins) {
    return;
  }

  const { presetKey: factoryPresetKey } = resolvePresetKey({ factoryPresetKey: presetKey });
  const preset = presets[factoryPresetKey];

  // Preset existence is validated separately.
  if (!preset) {
    return;
  }

  const supported = new Set(preset.manifest.map(({ module }) => module.getName()));

  assertUnsupportedPlugins(configuredPlugins, supported, `preset "${factoryPresetKey}"`);
}
