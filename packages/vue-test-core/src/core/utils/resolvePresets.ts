import type { CreateTestFrameworkOptions, TestFrameworkPresets } from "../../types.js";

/**
 * Normalizes framework preset options into a named preset collection.
 *
 * Wraps a single preset under the `"default"` key, returns an existing
 * preset collection as-is, or creates an empty collection when no
 * presets are configured.
 *
 * @param options - Framework configuration containing preset options.
 * @returns The normalized preset collection.
 */
export function resolvePresets(options: CreateTestFrameworkOptions): TestFrameworkPresets {
  if (options.preset !== undefined) {
    return {
      default: options.preset,
    };
  }

  return options.presets ?? {};
}
