import type { PipelineMiddleware, MountContext } from "../../../types";

import { assertIsObject } from "../typeGuards/assertIsObject.js";

/*
 * Ensures that the input configuration parameters are of the correct type.
 */
export const assertConfigurationShape: PipelineMiddleware = <T extends MountContext>(ctx: T) => {
  assertIsObject(ctx.defaultMountOptions, "defaultMountOptions");
  assertIsObject(ctx.mountOptions, "mountOptions");
  assertIsObject(ctx.extraOptions, "extraOptions");

  return ctx;
};
