import type { PipelineMiddleware, MountContext, PluginName } from "../../../types";

import { mergePluginPresets } from "../logic/mergePluginPresets.js";

/*
 * Creates a middleware that merges plugin presets into ctx.result.plugins[name].
 *
 * This middleware applies preset values as a base layer for a specific plugin,
 * while preserving any configuration already present in `ctx.result.plugins`.
 * If the plugin is explicitly disabled (`false`), no merging occurs.
 *
 * IMPORTANT:
 * - Does nothing if plugin is explicitly disabled (`false`)
 * - Does not interact with extraOptions
 */
export function createPluginMergeMiddleware(name: PluginName): PipelineMiddleware {
  return <T extends MountContext>(ctx: T): T => {
    return mergePluginPresets(ctx, name);
  };
}
