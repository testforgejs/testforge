import type { MountContext, PluginName, ResolvedPluginConfig } from "../../../types";

import { isPluginOverlayObject } from "../../middleware/typeGuards/isPluginOverlayObject.js";

/*
 * Extracts and merges the plugin configuration, taking all priority levels into account.
 *
 * Rules:
 * - Plugin is disabled ONLY if explicitly set to `false`
 * - Otherwise, returns a merged configuration object
 */
export function getPluginConfig(ctx: MountContext, name: PluginName): ResolvedPluginConfig | false {
  const base = ctx.result.plugins[name];

  const extraOptions = ctx.extraOptions as Record<string, any>;
  const overlay = extraOptions[name];

  const isEnabled =
    overlay !== undefined ? overlay !== false : base !== false && base !== undefined;

  if (!isEnabled) {
    return false;
  }

  const current = isPluginOverlayObject(base) ? base : {};
  const extra = isPluginOverlayObject(overlay) ? overlay : {};

  return {
    ...current,
    ...extra,
  };
}
