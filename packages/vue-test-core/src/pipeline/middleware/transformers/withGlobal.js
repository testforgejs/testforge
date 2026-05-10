import { mergeConfigs } from "../../../utils/mergeConfigs.js";
import { mergeResult } from "../../state/mergeResult.js";

/**
 * @type {PipelineMiddleware}
 */
export const withGlobal = (ctx) => {
  const { defaultMountOptions, mountOptions, extraOptions } = ctx;

  return mergeResult(ctx, {
    global: mergeConfigs(
      extraOptions.skipDefaultOptions ? {} : defaultMountOptions.global || {},
      mountOptions.global || {},
    ),
  });
};
