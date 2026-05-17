import type {
  ComponentFactoryExtraOptions,
  TestFrameworkPresets,
  PresetDefinition,
} from "../types";
import { validatePreset } from "./validatePreset.js";

/*
Retrieves the active preset based on the call parameters and available presets.

Selection logic:
1. If `extraOptions.preset` is specified → try to find it, otherwise throw.
2. If not specified → try to use preset named "default".
3. If preset exists → it is validated via `validatePreset`.
*/
export function getActivePreset(
  extraOptions?: ComponentFactoryExtraOptions,
  presets: TestFrameworkPresets = {},
): PresetDefinition | undefined {
  const requestedPresetName = extraOptions?.preset?.trim();
  const activeName = requestedPresetName || "default";
  const preset = presets[activeName];

  // If a user requests a preset that doesn't exist, an error will be thrown
  if (requestedPresetName && !preset) {
    throw new Error(
      `[withPreset] Requested preset "${requestedPresetName}" not found in available presets.`,
    );
  }

  if (preset) {
    validatePreset(activeName, preset);
  }

  return preset;
}
