/*
 * Shallowly merges a partial patch into a base record.
 *
 * Only defined properties from the patch are applied.
 * `undefined` values in the patch are ignored and do not overwrite the base.
 *
 * The function preserves the exact shape of `T` and guarantees
 * that the returned object has the same type as the base record.
 *
 * @example
 * const base = { a: 1, b: 2 }
 * mergeRecord(base, { b: 3 }) // { a: 1, b: 3 }
 *
 * @example
 * mergeRecord(base, { b: undefined }) // { a: 1, b: 2 }
 */
export function mergeRecord<T extends Record<string, any>>(base: T, patch?: Partial<T>): T {
  if (!patch) return base;

  const result: T = { ...base };

  for (const key in patch) {
    const value = patch[key];
    if (value !== undefined) {
      result[key] = value;
    }
  }

  return result;
}
