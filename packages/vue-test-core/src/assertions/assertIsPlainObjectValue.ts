import { isPlainObject } from "../guards/isPlainObject.js";

/*
 * Asserts that an unknown value is a plain object.
 *
 * Unlike `assertIsPlainObject`, this helper is intended for
 * runtime boundaries where the input type is unknown.
 */
export function assertIsPlainObjectValue(
  value: unknown,
  name = "value",
): asserts value is Record<string, unknown> {
  if (!isPlainObject(value)) {
    throw new Error(`${name} must be a plain object.`);
  }
}
