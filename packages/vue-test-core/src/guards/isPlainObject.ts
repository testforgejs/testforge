import type { PlainObject } from "../types";

/*
 * Checks whether a value is a plain object.
 *
 * Accepted:
 * - object literals ({})
 * - objects with a null prototype
 *
 * Rejected:
 * - null
 * - arrays
 * - functions
 * - built-in class instances (Date, RegExp, etc.)
 * - custom class instances
 */
export function isPlainObject(item: unknown): item is PlainObject {
  if (item === null || typeof item !== "object" || Array.isArray(item)) {
    return false;
  }

  const prototype = Object.getPrototypeOf(item);

  return prototype === Object.prototype || prototype === null;
}
