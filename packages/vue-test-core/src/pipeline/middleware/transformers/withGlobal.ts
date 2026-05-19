import type { PipelineMiddleware, MountContext } from "../../../types";

import { mergeConfigs } from "../../../utils/mergeConfigs.js";
import { patchResultState } from "../../state/patchResultState.js";

export const withGlobal: PipelineMiddleware = <T extends MountContext>(ctx: T) => {
  const { defaultMountOptions, mountOptions, extraOptions } = ctx;

  return patchResultState(ctx, {
    global: mergeConfigs(
      extraOptions.skipDefaultOptions ? {} : defaultMountOptions.global || {},
      mountOptions.global || {},
    ),
  });
};
