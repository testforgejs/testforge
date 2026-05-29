import type { PipelineMiddleware, Pipeline, PipeResult } from "../../types";

import { runPipeline } from "./runPipeline.js";

/*
 * Creates a typed middleware pipeline abstraction.
 *
 * The resulting pipeline preserves middleware input/output type flow
 * across all processing stages.
 */
export function createPipeline<In, Ms extends readonly PipelineMiddleware<any, any>[]>(
  middlewares: Ms,
): Pipeline<In, PipeResult<In, Ms>> {
  return {
    /*
     * Runs the middleware chain sequentially.
     */
    run(ctx: In) {
      return runPipeline(ctx, middlewares);
    },
  };
}
