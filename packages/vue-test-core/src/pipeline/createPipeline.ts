import type { PipelineMiddleware, Pipeline, PipeResult } from "../types";

import { runPipeline } from "./runPipeline.js";

/*
 * Creates a pipeline instance with the provided middleware chain.
 */
export function createPipeline<In, Ms extends readonly PipelineMiddleware<any, any>[]>(
  middlewares: Ms,
): Pipeline<In, PipeResult<In, Ms>> {
  return {
    /*
     * Executes the pipeline with the given context.
     */
    run(ctx: In) {
      return runPipeline(ctx, middlewares);
    },
  };
}
