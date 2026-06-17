import type { PipelineMiddleware, PipelineContext, RuntimeContext } from "../../../types";

import { assertIsObject } from "../typeGuards/assertIsObject.js";

/*
 * Validates the runtime shape of the incoming mount configuration.
 *
 * Ensures that all top-level pipeline configuration objects exist
 * and are valid plain objects before pipeline processing begins.
 */
export const assertConfigurationShape: PipelineMiddleware<PipelineContext, RuntimeContext> = (
  ctx,
): RuntimeContext => {
  assertIsObject(ctx.defaultMountOptions, "defaultMountOptions");
  assertIsObject(ctx.mountOptions, "mountOptions");
  assertIsObject(ctx.extraOptions, "extraOptions");

  return ctx as RuntimeContext;
};
