import { mergeConfigs } from "../../../utils/mergeConfigs.js";
import { patchResultState } from "../../state/patchResultState.js";

/**
 * @type {PipelineMiddleware}
 */
export const withGlobal = (ctx) => {
  const { defaultMountOptions, mountOptions, extraOptions } = ctx;

  return patchResultState(ctx, {
    global: mergeConfigs(
      extraOptions.skipDefaultOptions ? {} : defaultMountOptions.global || {},
      mountOptions.global || {},
    ),
  });
};
