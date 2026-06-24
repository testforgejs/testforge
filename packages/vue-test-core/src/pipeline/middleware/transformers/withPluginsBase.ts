import type { PipelineMiddleware, RuntimeContext } from "../../../types";

import { filterSupportedPlugins } from "../../plugins/logic/filterSupportedPlugins.js";
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
export const withPluginsBase: PipelineMiddleware<RuntimeContext> = (ctx): RuntimeContext => {
  const { defaultMountOptions, mountOptions, extraOptions, supportedPlugins } = ctx;

  return patchResultState(ctx, {
    plugins: {
      ...(extraOptions.skipDefaultOptions
        ? {}
        : filterSupportedPlugins(defaultMountOptions.plugins ?? {}, supportedPlugins)),
      ...(mountOptions.plugins || {}),
    },
  });
};
