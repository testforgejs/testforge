import type { PipelineMiddleware, PipelineContext } from "../../../types";

import { patchResultState } from "../../state/patchResultState.js";
import { mergeRecord } from "../../state/mergeRecord.js";

/*
 * Builds the final flat VTU mount options.
 *
 * This middleware processes only top-level mounting fields and excludes
 * plugin-related and `global` configuration, which are handled separately
 * by dedicated middleware layers.
 *
 * Merge priority:
 * - factory defaults (`defaultMountOptions`)
 * - per-test mount options (`mountOptions`)
 *
 * Factory defaults can be skipped via `extraOptions.skipDefaultOptions`.
 *
 * The resolved options are written into `ctx.result.mountOptions`.
 */
export const withBaseMountOptions: PipelineMiddleware = <T extends PipelineContext>(ctx: T) => {
  const { defaultMountOptions, mountOptions, extraOptions } = ctx;

  // Extract what should NOT be processed at this stage
  const { global: _dg, plugins: _dp, ...flatDefaults } = defaultMountOptions;

  const { global: _mg, plugins: _mp, ...flatOverrides } = mountOptions;

  return patchResultState(ctx, {
    mountOptions: extraOptions.skipDefaultOptions
      ? mergeRecord(flatOverrides)
      : mergeRecord(flatDefaults, flatOverrides),
  });
};
