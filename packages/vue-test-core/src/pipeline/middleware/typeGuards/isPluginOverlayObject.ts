import type { PluginMeta } from "../../../types";

/*
 * Checks whether a value is a valid PluginMeta object.
 *
 * Since `instance` is optional and accepts any value, only the
 * non-null, non-array object shape needs to be validated.
 */
function isPluginMeta(val: unknown): val is PluginMeta {
  return typeof val === "object" && val !== null && !Array.isArray(val);
}

/*
 * Checks whether a value is a valid plugin overlay object.
 *
 * A plugin overlay (from `extraOptions.plugins[pluginName]`) can be:
 * - an object with optional `__meta`
 * - `false` (explicit plugin disable)
 * - `undefined`
 *
 * Narrows the value to the object case and validates that `__meta`,
 * when provided, is a non-null, non-array object.
 *
 * Does not validate other overlay properties or `__meta.instance`.
 */
export function isPluginOverlayObject(
  val: unknown,
): val is Record<string, unknown> & { __meta?: PluginMeta } {
  if (typeof val !== "object" || val === null || Array.isArray(val)) {
    return false;
  }

  // Validate metadata only when explicitly provided.
  if ("__meta" in val && val.__meta !== undefined) {
    return isPluginMeta(val.__meta);
  }

  return true;
}
