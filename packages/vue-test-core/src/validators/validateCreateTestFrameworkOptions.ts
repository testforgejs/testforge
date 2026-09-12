import { validatePreset } from "../presets/validators/validatePreset.js";
import { validatePresets } from "../presets/validators/validatePresets.js";
import { assertIsPlainObjectValue } from "../assertions/assertIsPlainObjectValue.js";
import { ERROR_PREFIX } from "../constants/constants.js";

import type { CreateTestFrameworkOptions } from "../types";

/*
 * Validates createTestFramework() options.
 *
 * Validation rules:
 * - options must be a plain object
 * - `preset` and `presets` are mutually exclusive
 * - `preset` must be a valid preset when provided
 * - `presets` must be valid when provided
 * - `shallowByDefault` must be a boolean when provided
 */
export function validateCreateTestFrameworkOptions(
  options: unknown = {},
): asserts options is CreateTestFrameworkOptions {
  assertIsPlainObjectValue(options, "createTestFramework options");

  const { preset, presets, shallowByDefault } = options as Record<string, unknown>;

  if (preset !== undefined && presets !== undefined) {
    throw new Error(`${ERROR_PREFIX} "preset" and "presets" cannot be used together.`);
  }

  if (preset !== undefined) {
    validatePreset("default", preset);
  }

  if (presets !== undefined) {
    validatePresets(presets);
  }

  if (shallowByDefault !== undefined && typeof shallowByDefault !== "boolean") {
    throw new Error(`${ERROR_PREFIX} "shallowByDefault" must be a boolean.`);
  }
}
