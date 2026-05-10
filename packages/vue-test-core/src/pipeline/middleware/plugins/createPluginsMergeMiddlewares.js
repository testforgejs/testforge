import { createPluginMergeMiddleware } from "../plugins/createPluginMergeMiddleware.js";

/**
 * Creates middleware that merges plugin presets into plugin configurations.
 *
 * This represents a dedicated pipeline phase that runs **after**
 * plugin base initialization (`withPluginsBase`) and **before**
 * plugin-specific middleware execution.
 *
 * At this stage, each plugin receives its preset values as a base layer,
 * while preserving any configuration already present in `ctx.result.plugins`.
 *
 * @param {SupportedPluginsMap} supportedPlugins
 * @returns {PipelineMiddleware[]}
 */
export function createPluginsMergeMiddlewares(supportedPlugins) {
  return Object.keys(supportedPlugins).map((name) =>
    createPluginMergeMiddleware(/** @type {PluginName} */ (name)),
  );
}
