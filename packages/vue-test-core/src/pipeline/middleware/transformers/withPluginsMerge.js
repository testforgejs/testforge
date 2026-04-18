import { mergePluginPresets } from '../helpers/mergePluginPresets'

/** @type {PipelineMiddleware} */
export const withPluginsMerge = (ctx) => {
    const { supportedPlugins } = ctx

    Object.keys(supportedPlugins).forEach((name) => {
        mergePluginPresets(ctx, name)
    })

    return ctx
}
