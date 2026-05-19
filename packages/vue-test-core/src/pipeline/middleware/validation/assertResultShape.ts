import type { PipelineMiddleware, MountContext, ResultReadyContext } from "../../../types";

import { assertIsObject } from "./typeGuards/assertIsObject.js";

/*
 * Validates ctx.result structure.
 */
export const assertResultShape: PipelineMiddleware<MountContext, ResultReadyContext> = (ctx) => {
  const { result } = ctx;

  assertIsObject(result, "result");
  assertIsObject(result.mountOptions, "result.mountOptions");
  assertIsObject(result.global, "result.global");
  assertIsObject(result.plugins, "result.plugins");

  return ctx as ResultReadyContext;
};
