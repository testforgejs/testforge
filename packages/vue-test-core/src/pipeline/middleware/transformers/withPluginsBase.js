import { patchResultState } from "../../state/patchResultState.js";

/**
 * Initializes the base plugin object in the result.
 * Ensures ctx.result.plugins is a valid object.
 *
 * @type {PipelineMiddleware}
 */
export const withPluginsBase = (ctx) => {
  const { defaultMountOptions, mountOptions, extraOptions } = ctx;

  return patchResultState(ctx, {
    plugins: {
      ...(extraOptions.skipDefaultOptions
        ? {}
        : defaultMountOptions.plugins || {}),
      ...(mountOptions.plugins || {}),
    },
  });
};
