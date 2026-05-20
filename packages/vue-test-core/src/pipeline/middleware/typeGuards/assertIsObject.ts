/**
 * Runtime assertion that ensures a value is a plain object.
 *
 * Designed specifically for validating external or unsafe inputs
 * (e.g. user config, pipeline context parts) before further processing.
 *
 * Important:
 * This function intentionally accepts `unknown` instead of a generic type.
 * Runtime validation must operate on unknown data. After the assertion,
 * TypeScript safely narrows the value to `Record<string, unknown>`.
 *
 * This pattern avoids mixing generics with runtime type checks,
 * which leads to unsound type assertions.
 *
 * @param val - Value to validate
 * @param name - Logical name used in error message
 *
 * @throws Error if value is not a non-null, non-array object
 */
export function assertIsObject(val: unknown, name: string): asserts val is Record<string, unknown> {
  if (val !== null && typeof val === "object" && !Array.isArray(val)) return;

  throw new Error(
    `[TestFramework] Critical error: "${name}" must be an Object. ` +
      `Received ${Array.isArray(val) ? "array" : typeof val} (${val}).`,
  );
}
