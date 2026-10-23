// packages/vue-test-core/src/pipeline/middleware/typeGuards/isPluginOverlayObject.ts

import { PLUGIN_META_KEY } from "../../../constants/constants.js";

import type { PluginMeta, ResolvedPluginConfig } from "../../../types";

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
 * - an object with optional symbol-keyed plugin metadata
 * - `false` (explicit plugin disable)
 * - `undefined`
 *
 * Narrows the value to the object case and validates that plugin metadata,
 * when provided, is a non-null, non-array object.
 *
 * Does not validate other overlay properties or the metadata instance.
 */
export function isPluginOverlayObject(val: unknown): val is ResolvedPluginConfig {
  if (typeof val !== "object" || val === null || Array.isArray(val)) {
    return false;
  }

  // Validate metadata only when explicitly provided.
  if (PLUGIN_META_KEY in val && val[PLUGIN_META_KEY] !== undefined) {
    return isPluginMeta(val[PLUGIN_META_KEY]);
  }

  return true;
}
