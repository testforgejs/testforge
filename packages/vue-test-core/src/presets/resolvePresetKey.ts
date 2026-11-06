import { DEFAULT_PRESET_NAME } from "../constants/constants.js";

import type { PresetKey } from "../types.js";

/** Selection result shared by factory validation and the mount pipeline. */
export interface ResolvedPresetKey {
  /** The key used to look up the preset, including the implicit default. */
  presetKey: PresetKey;

  /** Raw factory/mount selection; undefined only when neither selected a key. */
  requestedPresetKey: PresetKey | undefined;

  /** Non-empty explicitly selected key, normalized for lookup and errors. */
  explicitPresetKey: PresetKey | undefined;
}

/*
 * Resolves mount → factory → default precedence without looking up a preset.
 *
 * Keeping the raw selection distinct from the implicit fallback matters:
 * an explicitly requested missing preset is an error, while a missing
 * implicit "default" preset permits mounting without an active preset.
 */
export function resolvePresetKey({
  factoryPresetKey,
  mountPresetKey,
}: {
  factoryPresetKey?: PresetKey;
  mountPresetKey?: PresetKey;
} = {}): ResolvedPresetKey {
  const requestedPresetKey = mountPresetKey ?? factoryPresetKey;
  const explicitPresetKey = requestedPresetKey?.trim() || undefined;

  return {
    presetKey: explicitPresetKey ?? DEFAULT_PRESET_NAME,
    requestedPresetKey,
    explicitPresetKey,
  };
}
