import { validatePresets } from "./validatePresets.js";
import { assertIsPlainObject } from "../assertions/assertIsPlainObject.js";
import { ERROR_PREFIX } from "../constants/constants.js";

import type { CreateTestFrameworkOptions } from "../types";

/*
 * Validates createTestFramework() options.
 *
 * Validation rules:
 * - options must be a plain object
 * - presets must be valid
 * - shallowByDefault must be a boolean when provided
 */
export function validateCreateTestFrameworkOptions(options: CreateTestFrameworkOptions = {}): void {
  assertIsPlainObject(options, "createTestFramework options");

  const { shallowByDefault, presets } = options;

  if (presets !== undefined) {
    validatePresets(presets);
  }

  if (shallowByDefault !== undefined && typeof shallowByDefault !== "boolean") {
    throw new Error(`${ERROR_PREFIX} "shallowByDefault" must be a boolean.`);
  }
}
