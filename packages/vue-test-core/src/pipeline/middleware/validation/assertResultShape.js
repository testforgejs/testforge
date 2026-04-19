/**
 * Validates ctx.result structure.
 *
 * @type {PipelineMiddleware}
 */
export const assertResultShape = (ctx) => {
  const { result } = ctx;

  if (!result || typeof result !== "object") {
    throw new Error("[pipeline] result must be an object");
  }

  if (!result.mountOptions || typeof result.mountOptions !== "object") {
    throw new Error("[pipeline] result.mountOptions must be an object");
  }

  if (!result.global || typeof result.global !== "object") {
    throw new Error("[pipeline] result.global must be an object");
  }

  if (!result.plugins || typeof result.plugins !== "object") {
    throw new Error("[pipeline] result.plugins must be an object");
  }
};
