import { resolvePresetKey } from "../../presets/resolvePresetKey.js";

import type { ComponentFactoryExtraOptions, PresetKey } from "../../types.js";

/*
 * Resolves mount extra options by inheriting the factory preset selection.
 *
 * Mount-level preset selection takes precedence over the factory preset.
 * An implicit default remains absent from the returned options.
 *
 * Does not mutate the provided options.
 */
export function resolveMountExtraOptions(
  extraOptions: ComponentFactoryExtraOptions,
  factoryPresetKey?: PresetKey,
): ComponentFactoryExtraOptions {
  const { requestedPresetKey } = resolvePresetKey({
    factoryPresetKey,
    mountPresetKey: extraOptions.presetKey,
  });

  return requestedPresetKey === undefined
    ? extraOptions
    : { ...extraOptions, presetKey: requestedPresetKey };
}
