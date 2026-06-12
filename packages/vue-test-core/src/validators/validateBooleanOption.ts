import { ERROR_PREFIX } from "../constants/constants.js";

/*
 * Validates an optional boolean option.
 *
 * Validation rules:
 * - undefined is allowed
 * - defined values must be boolean
 */
export function validateBooleanOption(value: unknown, name: string): void {
  if (value !== undefined && typeof value !== "boolean") {
    throw new Error(`${ERROR_PREFIX} "${name}" must be a boolean.`);
  }
}
