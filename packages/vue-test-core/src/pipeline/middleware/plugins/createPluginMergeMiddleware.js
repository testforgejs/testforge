import { mergePluginPresets } from "./mergePluginPresets.js";

/**
 * Creates middleware that merges plugin presets into the current plugin config.
 *
 * This middleware applies preset values as a base layer for a specific plugin,
 * while preserving any configuration already present in `ctx.result.plugins`.
 * If the plugin is explicitly disabled (`false`), no merging occurs.
 *
 * Designed to be used after plugin base initialization and before
 * plugin-specific middleware execution.
 *
 * @param {PluginName} name - The name of the plugin (e.g. 'pinia', 'i18n', 'router')
 * @returns {PipelineMiddleware}
 */
export function createPluginMergeMiddleware(name) {
  /** @type {PipelineMiddleware} */
  return (ctx) => {
    return mergePluginPresets(ctx, name);
  };
}
