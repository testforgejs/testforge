import type { PipelineMiddleware, PipelineContext, PipeResult } from "../../types";

/*
 * Runs middleware sequentially using the current context value.
 *
 * Each middleware receives the accumulated context from the previous stage
 * and may return an updated context object.
 */
export function runPipeline<
  In extends PipelineContext,
  Ms extends readonly PipelineMiddleware<PipelineContext, PipelineContext>[],
>(ctx: In, middlewares: Ms): PipeResult<In, Ms> {
  let context: PipelineContext = ctx;

  for (const middleware of middlewares) {
    const result = middleware(context);
    if (result) {
      context = result;
    }
  }

  return context as PipeResult<In, Ms>;
}
