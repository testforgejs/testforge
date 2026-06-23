import { getPresetManifest } from "./getPresetManifest.js";

import type { PresetDefinition, SupportedPluginsMap } from "../types";

/*
 * Creates a capability map of plugins supported by the active preset.
 *
 * Responsibilities:
 * - declares which plugins exist in the current runtime
 * - defines whether each plugin is enabled by default
 *
 * This function does NOT create runtime plugin configs.
 * Runtime plugin state is resolved later inside plugin middleware.
 *
 * Result semantics:
 * - `true`  → plugin is supported and enabled by default
 * - `false` → plugin is supported but disabled by default
 */
export function createSupportedPluginsState(
  preset: PresetDefinition | undefined,
): SupportedPluginsMap {
  const map: SupportedPluginsMap = {};

  for (const { module, enabled } of getPresetManifest(preset)) {
    if (typeof enabled !== "boolean") {
      throw new Error(
        `[TestForge] Plugin "${module.getName()}" has invalid "enabled" value: ${String(enabled)}. Expected boolean.`,
      );
    }

    map[module.getName()] = enabled;
  }

  return map;
}
