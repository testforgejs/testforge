/**
 * @param {SupportedPluginsMap} supportedPlugins
 * @returns {PipelineMiddleware[]}
 */
import { createPluginMiddleware } from "./createPluginMiddleware.js";

export function createPluginsMiddlewares(supportedPlugins) {
  return Object.keys(supportedPlugins).map((name) =>
    createPluginMiddleware(/** @type {PluginName} */ (name)),
  );
}
