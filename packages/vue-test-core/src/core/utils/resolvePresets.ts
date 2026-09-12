import type { CreateTestFrameworkOptions, TestFrameworkPresets } from "../../types";

/*
 * Resolves framework preset options into a normalized preset collection.
 *
 * A single preset is exposed as the `default` preset.
 * When a preset collection is provided, it is returned unchanged.
 * When no presets are configured, an empty collection is returned.
 */
export function resolvePresets(options: CreateTestFrameworkOptions): TestFrameworkPresets {
  if (options.preset !== undefined) {
    return {
      default: options.preset,
    };
  }

  return options.presets ?? {};
}
