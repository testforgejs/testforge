import type { PipelineMiddleware, PipelineContext } from "../../../types";

import { mergeConfigs } from "../../../utils/mergeConfigs.js";
import { patchResultState } from "../../state/patchResultState.js";

/*
 * Builds the final VTU `global` mounting configuration.
 *
 * Merge priority:
 * - factory defaults (`defaultMountOptions.global`)
 * - per-test mount options (`mountOptions.global`)
 *
 * Factory defaults can be skipped via `extraOptions.skipDefaultOptions`.
 *
 * The resolved global config is written into `ctx.result.global`.
 */
export const withGlobal: PipelineMiddleware = <T extends PipelineContext>(ctx: T) => {
  const { defaultMountOptions, mountOptions, extraOptions } = ctx;

  return patchResultState(ctx, {
    global: mergeConfigs(
      extraOptions.skipDefaultOptions ? {} : defaultMountOptions.global || {},
      mountOptions.global || {},
    ),
  });
};
