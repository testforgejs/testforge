import { ERROR_PREFIX } from "../constants/constants.js";
import { isPlainObject } from "../guards/isPlainObject.js";

/*
 * Validates that an argument is a plain object.
 *
 * Validation rules:
 * - the value must not be null
 * - the value must not be an array
 * - the value must be a plain object
 */
export function validatePlainObjectArgument(value: unknown, name: string): void {
  if (!isPlainObject(value)) {
    throw new Error(`${ERROR_PREFIX} "${name}" must be a plain object.`);
  }
}
