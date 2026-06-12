import { validatePreset } from "./validatePreset.js";
import { isPlainObject } from "../guards/isPlainObject.js";
import { ERROR_PREFIX } from "../constants/constants.js";

import type { TestFrameworkPresets } from "../types";

/*
 * Validates the preset registry.
 *
 * Validation rules:
 * - presets must be a plain object
 * - each preset must have a valid name
 * - each preset definition is validated independently
 */
export function validatePresets(presets: TestFrameworkPresets = {}): void {
  if (!isPlainObject(presets)) {
    throw new Error(`${ERROR_PREFIX} Presets must be a plain object.`);
  }

  Object.entries(presets).forEach(([name, preset]) => {
    validatePreset(name, preset);
  });
}
