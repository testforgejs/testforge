import { mergePluginPresets } from './mergePluginPresets'

export function createPluginMergeMiddleware(name) {
    /** @type {PipelineMiddleware} */
    return (ctx) => {
        return mergePluginPresets(ctx, name)
    }
}
