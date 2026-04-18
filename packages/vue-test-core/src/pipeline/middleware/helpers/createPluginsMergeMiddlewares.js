import { createPluginMergeMiddleware } from './createPluginMergeMiddleware'

/**
 * @param {SupportedPluginsMap} supportedPlugins
 * @returns {PipelineMiddleware[]}
 */
export function createPluginsMergeMiddlewares(supportedPlugins) {
    return Object.keys(supportedPlugins).map((name) =>
        createPluginMergeMiddleware(/** @type {PluginName} */ (name))
    )
}
