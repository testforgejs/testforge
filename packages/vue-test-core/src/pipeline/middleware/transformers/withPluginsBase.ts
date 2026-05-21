import type { PipelineMiddleware, MountContext } from "../../../types";

import { patchResultState } from "../../state/patchResultState.js";

/*
 * Builds the initial plugin configuration state.
 *
 * Merge priority:
 * - factory plugin defaults (`defaultMountOptions.plugins`)
 * - per-test plugin options (`mountOptions.plugins`)
 *
 * Factory defaults can be skipped via `extraOptions.skipDefaultOptions`.
 *
 * The resolved plugin config is written into `ctx.result.plugins`
 * and later processed by plugin-specific middleware layers.
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
