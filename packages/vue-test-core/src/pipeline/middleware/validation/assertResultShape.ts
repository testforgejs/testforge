import type { PipelineMiddleware, PipelineContext, ResultReadyContext } from "../../../types";

import { assertIsObject } from "../typeGuards/assertIsObject.js";

/*
 * Validates the runtime structure of `ctx.result`.
 *
 * Ensures that all result containers required by subsequent middleware
 * exist and are valid objects before state mutation begins.
 *
 * After successful validation, the pipeline can safely treat
 * `ctx.result` as fully initialized.
 */
export const assertResultShape: PipelineMiddleware<PipelineContext, ResultReadyContext> = (
  ctx,
): ResultReadyContext => {
  const { result } = ctx;

  assertIsObject(result, "result");
  assertIsObject(result.mountOptions, "result.mountOptions");
  assertIsObject(result.global, "result.global");
  assertIsObject(result.plugins, "result.plugins");

  return ctx as ResultReadyContext;
};
