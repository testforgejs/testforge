import { createPluginMergeMiddleware } from "./createPluginMergeMiddleware.js";

/**
 * @param {SupportedPluginsMap} supportedPlugins
 * @returns {PipelineMiddleware[]}
 */
export function createPluginsMergeMiddlewares(supportedPlugins) {
  return Object.keys(supportedPlugins).map((name) =>
    createPluginMergeMiddleware(/** @type {PluginName} */ (name)),
  );
}
