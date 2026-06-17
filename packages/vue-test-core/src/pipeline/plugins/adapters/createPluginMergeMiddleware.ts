import type {
  PipelineMiddleware,
  PipelineContext,
  RuntimeContext,
  PluginName,
} from "../../../types";

import { mergePluginDefaults } from "../logic/mergePluginDefaults.js";

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
export function createPluginMergeMiddleware(
  name: PluginName,
): PipelineMiddleware<RuntimeContext, RuntimeContext> {
  return <T extends PipelineContext>(ctx: T): T => {
    return mergePluginDefaults(ctx, name);
  };
}
