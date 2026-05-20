import type { PluginMeta } from "../../../../types";

/*
 * Type guard that checks whether a value is a valid plugin overlay object.
 *
 * In the framework, a plugin overlay (from `extraOptions[pluginName]`) can be:
 * - an object with optional `__meta`
 * - `false` (explicit plugin disable)
 * - `undefined`
 *
 * This guard narrows the value to the object case only, allowing safe access
 * to overlay fields such as `__meta` without unsafe casts.
 *
 * IMPORTANT:
 * This guard does NOT validate the shape of the overlay itself.
 * It only ensures that the value is a non-null, non-array object.
 *
 * Runtime purpose:
 *   Safely distinguish between `{ ...overlay }` and `false | undefined`.
 *
 * Type-level purpose:
 *   Narrow `unknown | false | undefined` to
 *   `Record<string, unknown> & { __meta?: PluginMeta }`.
 */
export function isPluginOverlayObject(
  val: unknown,
): val is Record<string, unknown> & { __meta?: PluginMeta } {
  return typeof val === "object" && val !== null && !Array.isArray(val);
}
