import type {
  ComponentFactoryExtraOptions,
  TestFrameworkPresets,
  PresetDefinition,
} from "../types.js";

import { validatePreset } from "./validators/validatePreset.js";
import { resolvePresetKey } from "./resolvePresetKey.js";

/*
 * Retrieves the active preset based on the call parameters and available presets.
 *
 * Selection logic:
 * 1. If `extraOptions.presetKey` is specified → try to find it, otherwise throw.
 * 2. If not specified → try to use preset named "default".
 * 3. If preset exists → it is validated via `validatePreset`.
 */
export function getActivePreset(
  presets: TestFrameworkPresets = {},
  extraOptions?: ComponentFactoryExtraOptions,
): PresetDefinition | undefined {
  const { presetKey: activeName, explicitPresetKey } = resolvePresetKey({
    mountPresetKey: extraOptions?.presetKey,
  });
  const preset = presets[activeName];

  // If a user requests a preset that doesn't exist, an error will be thrown
  if (explicitPresetKey && !preset) {
    throw new Error(
      `[withPreset] Requested preset "${explicitPresetKey}" not found in available presets.`,
    );
  }

  if (preset) {
    validatePreset(activeName, preset);
  }

  return preset;
}
