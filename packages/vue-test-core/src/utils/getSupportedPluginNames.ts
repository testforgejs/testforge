import type { ComponentFactoryExtraOptions, PluginName, TestFrameworkPresets } from "../types";

import { getActivePreset } from "./getActivePreset.js";

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
  const activePreset = getActivePreset(presets, extraOptions);

  return activePreset ? activePreset.manifest.map((entry) => entry.module.getName()) : [];
}
