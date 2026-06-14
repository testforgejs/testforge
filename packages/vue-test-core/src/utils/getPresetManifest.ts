import type { PresetDefinition, PluginManifestEntry } from "../types";

/*
 * Returns the plugin manifest declared by a preset.
 *
 * Responsibilities:
 * - provides a safe way to access `preset.manifest`
 * - returns an empty array when no preset is available
 *
 * This helper allows callers to iterate over plugin entries
 * without additional null checks.
 */
export function getPresetManifest(preset: PresetDefinition | undefined): PluginManifestEntry[] {
  return preset?.manifest ?? [];
}
