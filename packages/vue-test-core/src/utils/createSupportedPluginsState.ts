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
 */ export function createSupportedPluginsState(
  preset: PresetDefinition | undefined,
): SupportedPluginsMap {
  const map: SupportedPluginsMap = {};

  if (!preset?.manifest) return map;

  for (const { module, enabled } of preset.manifest) {
    map[module.getName()] = enabled;
  }

  return map;
}
