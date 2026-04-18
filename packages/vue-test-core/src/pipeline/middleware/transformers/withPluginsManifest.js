import { mergeResult } from '../helpers/mergeResult'

/**
 * Initializes the state of the plugins based on the manifest of supported plugins.
 * @type {PipelineMiddleware}
 */
export const withPluginsManifest = (ctx) => {
    const { supportedPlugins } = ctx

    return mergeResult(ctx, {
        plugins: supportedPlugins,
    })
}
