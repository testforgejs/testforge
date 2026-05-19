import type { PipelineMiddleware, MountContext } from "../../../types";

import { patchResultState } from "../../state/patchResultState.js";

/*
 * Initializes the base plugin object in the result.
 * Ensures ctx.result.plugins is a valid object.
 */
export const withPluginsBase: PipelineMiddleware = <T extends MountContext>(ctx: T) => {
  const { defaultMountOptions, mountOptions, extraOptions } = ctx;

  return patchResultState(ctx, {
    plugins: {
      ...(extraOptions.skipDefaultOptions ? {} : defaultMountOptions.plugins || {}),
      ...(mountOptions.plugins || {}),
    },
  });
};
