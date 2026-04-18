import { runPipeline } from './runPipeline'

/**
 * @param {PipelineMiddleware[]} middlewares
 */
export function createPipeline(middlewares) {
    return {
        /**
         * @param {MountContext} ctx
         */
        run(ctx) {
            return runPipeline(ctx, middlewares)
        },
    }
}
