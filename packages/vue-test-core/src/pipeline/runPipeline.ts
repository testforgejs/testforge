import type { PipelineMiddleware, PipeResult } from "../types";

/*
 * Runs pipeline middlewares sequentially.
 * Each middleware can return a new context or falsy value to keep the previous one.
 */
export function runPipeline<In, Ms extends readonly PipelineMiddleware<any, any>[]>(
  ctx: In,
  middlewares: Ms,
): PipeResult<In, Ms> {
  let context: any = ctx;

  for (const middleware of middlewares) {
    const result = middleware(context);
    if (result) {
      context = result;
    }
  }

  return context;
}
