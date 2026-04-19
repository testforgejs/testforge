import { deepMerge } from "../../../utils/deepMerge.js";
import { mergeResult } from "../helpers/mergeResult.js";

/**
 * @type {PipelineMiddleware}
 */
export const withGlobal = (ctx) => {
  const { defaultMountOptions, mountOptions, extraOptions } = ctx;

  return mergeResult(ctx, {
    global: deepMerge(
      extraOptions.skipDefaultOptions ? {} : defaultMountOptions.global || {},
      mountOptions.global || {},
    ),
  });
};
