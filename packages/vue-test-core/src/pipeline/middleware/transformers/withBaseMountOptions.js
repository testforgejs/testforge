import { mergeResult } from "../helpers/mergeResult.js";

/**
 * Processes only flat configuration settings (excluding global and plugins)
 * @type {PipelineMiddleware}
 */
export const withBaseMountOptions = (ctx) => {
  const { defaultMountOptions, mountOptions, extraOptions } = ctx;

  // Extract what should NOT be processed at this stage
  const { global: _dg, plugins: _dp, ...restDefaults } = defaultMountOptions;

  const { global: _mg, plugins: _mp, ...restOverrides } = mountOptions;

  // Merge only the “remnants” (flat fields)
  return mergeResult(ctx, {
    mountOptions: extraOptions.skipDefaultOptions
      ? { ...restOverrides }
      : { ...restDefaults, ...restOverrides },
  });
};
