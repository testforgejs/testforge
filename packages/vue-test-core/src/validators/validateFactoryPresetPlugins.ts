import { assertUnsupportedPlugins } from "./assertUnsupportedPlugins.js";

import type { ComponentFactoryOptions, PresetKey, TestFrameworkPresets } from "../types.js";

/*
 * Validates that defaultMountOptions.plugins contains only
 * plugins supported by the explicitly selected factory preset.
 *
 * Validation is skipped when no factory preset is specified
 * to preserve the existing positional API behavior.
 */
export function validateFactoryPresetPlugins(
  defaultMountOptions: ComponentFactoryOptions,
  presetKey: PresetKey | undefined,
  presets: TestFrameworkPresets,
): void {
  if (presetKey === undefined) {
    return;
  }

  const preset = presets[presetKey];

  // Preset existence is validated by validateComponentFactoryConfig().
  if (!preset) {
    return;
  }

  const configuredPlugins = defaultMountOptions.plugins;

  if (!configuredPlugins) {
    return;
  }

  const supported = new Set(preset.manifest.map(({ module }) => module.getName()));

  assertUnsupportedPlugins(configuredPlugins, supported, `preset "${presetKey}"`);
}
