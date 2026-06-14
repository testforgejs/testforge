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
export const withBaseMountOptions: PipelineMiddleware = <T extends PipelineContext>(ctx: T): T => {
  const { defaultMountOptions, mountOptions, extraOptions } = ctx;

  // Extract options that are not part of the flat VTU mount option layer.
  //
  // Pipeline-managed:
  // - global
  // - plugins
  // - attrs
  //
  // Resolved outside the pipeline:
  // - props
  // - slots
  //
  // Props and slots have their own merge strategy and support
  // skipDefaultProps / skipDefaultSlots, therefore they are
  // resolved before pipeline execution.
  const {
    global: _dg,
    plugins: _dp,
    attrs: _da,
    props: _dpr,
    slots: _ds,
    ...flatDefaults
  } = defaultMountOptions;

  const {
    global: _mg,
    plugins: _mp,
    attrs: _ma,
    props: _mpr,
    slots: _ms,
    ...flatOverrides
  } = mountOptions;

  return patchResultState(ctx, {
    mountOptions: extraOptions.skipDefaultOptions
      ? mergeRecord(flatOverrides)
      : mergeRecord(flatDefaults, flatOverrides),
  });
};
