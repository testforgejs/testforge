import { validatePreset } from "./validatePreset.js";
import { isPlainObject } from "../../guards/isPlainObject.js";
import { ERROR_PREFIX } from "../../constants/constants.js";

import type { TestFrameworkPresets } from "../../types.js";

/**
 * Validates a registry of named presets and narrows its type on success.
 *
 * Ensures that the registry is a plain object and that every registered
 * preset satisfies the validation rules enforced by `validatePreset()`.
 *
 * An empty registry is allowed.
 *
 * @param presets - The value to validate as a registry of named presets.
 *
 * @throws {Error} If the registry is not a plain object or any registered
 * preset fails validation.
 */
export function validatePresets(presets: unknown): asserts presets is TestFrameworkPresets {
  if (!isPlainObject(presets)) {
    throw new Error(`${ERROR_PREFIX} Presets must be a plain object.`);
  }

  Object.entries(presets).forEach(([name, preset]) => {
    validatePreset(name, preset);
  });
}
