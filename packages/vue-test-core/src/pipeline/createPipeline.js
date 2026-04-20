import { runPipeline } from "./runPipeline.js";

/**
 * Creates a pipeline instance with provided middlewares.
 *
 * @param {PipelineMiddleware[]} middlewares
 * @returns {Pipeline}
 */
export function createPipeline(middlewares) {
  return {
    /**
     * Runs the pipeline.
     *
     * @param {MountContext} ctx
     * @returns {MountContext}
     */
    run(ctx) {
      return runPipeline(ctx, middlewares);
    },
  };
}
