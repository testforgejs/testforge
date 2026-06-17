import type {
  PipelineMiddleware,
  PipelineContext,
  RuntimeContext,
  MountReadyContext,
} from "../../../types";

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
function validateResult(ctx: PipelineContext): void {
  const { result } = ctx;
  assertIsObject(result, "result");
  assertIsObject(result.mountOptions, "result.mountOptions");
  assertIsObject(result.global, "result.global");
  assertIsObject(result.plugins, "result.plugins");
}

/*
 * Validates the initial runtime structure of `ctx.result`.
 *
 * Ensures that all top-level result containers required by subsequent transformers
 * exist and are valid plain objects before the pipeline begins data injection.
 *
 * Transmutes the pipeline context from `PipelineContext` to `RuntimeContext`
 * to guarantee that all result sub-objects are fully initialized.
 */
export const assertResultShape: PipelineMiddleware<RuntimeContext, RuntimeContext> = (
  ctx,
): RuntimeContext => {
  validateResult(ctx);
  return ctx as RuntimeContext;
};

/*
 * Performs final post-processing runtime validation of the pipeline result.
 *
 * Runs as the last stage of the mounting pipeline to ensure that no middleware
 * or dynamic plugin layers corrupted the required `ctx.result` structure.
 *
 * Strictly maintains the `MountReadyContext` signature to prevent
 * compile-time type erasure, guaranteeing that all resolved plugin types
 * remain accessible at the end of execution.
 */
export const assertFinalResultShape: PipelineMiddleware<RuntimeContext, MountReadyContext> = (
  ctx,
): MountReadyContext => {
  validateResult(ctx);
  return ctx as MountReadyContext;
};
