import type { ComponentFactoryExtraOptions, PluginName, TestFrameworkPresets } from "../types.js";

import { resolveActivePreset } from "../presets/resolveActivePreset.js";
import { getPresetManifest } from "./getPresetManifest.js";

/*
 * Returns plugin names declared in the active preset.
 *
 * Resolution logic:
 * - determines the active preset using extraOptions
 * - returns plugin names from the preset manifest
 * - returns an empty array when no active preset exists
 */
export function getSupportedPluginNames(
  presets: TestFrameworkPresets = {},
  extraOptions?: ComponentFactoryExtraOptions,
): PluginName[] {
  const activePreset = resolveActivePreset(presets, extraOptions);

  return getPresetManifest(activePreset).map((entry) => entry.module.getName());
}
