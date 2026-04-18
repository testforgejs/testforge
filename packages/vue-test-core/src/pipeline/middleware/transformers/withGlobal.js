import { deepMerge } from '../../../utils/deepMerge'
import { mergeResult } from '../helpers/mergeResult'

/**
 * @type {PipelineMiddleware}
 */
export const withGlobal = (ctx) => {
    const { defaultMountOptions, mountOptions, extraOptions } = ctx

    return mergeResult(ctx, {
        global: deepMerge(
            extraOptions.skipDefaultOptions
                ? {}
                : defaultMountOptions.global || {},
            mountOptions.global || {}
        ),
    })
}
