/**
 * Asserts that a plugin configuration value has a valid shape.
 *
 * This function is used by validation middleware to ensure that
 * plugin options coming from `defaultMountOptions`, `mountOptions`,
 * and `extraOptions` are safe to merge into the pipeline result.
 *
 * Allowed values:
 * - `undefined` — plugin not configured
 * - `false` — plugin explicitly disabled
 * - `Object` — plugin configuration
 *
 * Disallowed values:
 * - `null`
 * - arrays
 * - primitives (string, number, boolean true, etc.)
 *
 * Besides runtime validation, this function also acts as a
 * TypeScript assertion, narrowing the value to:
 *
 *    Record<string, unknown> | false | undefined
 *
 * This is important for the type-safety of the pipeline result.
 *
 * @param val - plugin configuration value to validate
 * @param name - plugin name (used in error messages)
 * @param source - where this value came from (plugins | extraOptions)
 *
 * @throws Error if the value has invalid shape
 */
export function assertPluginValue(
  val: unknown,
  name: string,
  source: string,
): asserts val is Record<string, unknown> | false | undefined {
  const isObject = val !== null && typeof val === "object" && !Array.isArray(val);

  const isValid = val === undefined || val === false || isObject;

  if (!isValid) {
    throw new Error(
      `[TestFramework] Invalid configuration for plugin "${name}" in ${source}. ` +
        `Expected Object or Boolean (false), but received ${typeof val} (${val}).`,
    );
  }
}
