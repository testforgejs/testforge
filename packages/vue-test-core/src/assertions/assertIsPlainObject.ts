import { isPlainObject } from "../guards/isPlainObject.js";

/*
 * Asserts that a value is a plain object.
 *
 * Unlike assertions that narrow `unknown` to `Record<string, unknown>`,
 * this helper intentionally preserves the original object type.
 *
 * Runtime checks:
 * - value is not null
 * - value is an object
 * - value is not an array
 *
 * The generic parameter `<T>` is preserved intentionally so that
 * existing type information is not widened after the assertion.
 */
export function assertIsPlainObject<T extends object>(
  value: T,
  name = "value",
): asserts value is T {
  if (!isPlainObject(value)) {
    throw new Error(`${name} must be a plain object.`);
  }
}
