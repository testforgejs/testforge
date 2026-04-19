/**
 * Runs pipeline middlewares sequentially.
 *
 * @param {MountContext} ctx
 * @param {PipelineMiddleware[]} middlewares
 * @returns {MountContext}
 */
export function runPipeline(ctx, middlewares) {
  return middlewares.reduce((acc, middleware) => {
    const result = middleware(acc);
    return result || acc;
  }, ctx);
}
