import type { PipelineMiddleware, RuntimeContext } from "../../../types";

import { patchResultState } from "../../state/patchResultState.js";
import { mergeRecord } from "../../state/mergeRecord.js";

/*
 * Resolves VTU `attrs` mounting option.
 *
 * Responsibilities:
 * - merge defaultMountOptions.attrs with mountOptions.attrs
 * - allow mountOptions.attrs to override default values
 * - respect skipDefaultOptions flag
 *
 * Priority:
 * mountOptions.attrs > defaultMountOptions.attrs
 */
export const withAttrs: PipelineMiddleware<RuntimeContext> = (ctx): RuntimeContext => {
  const { defaultMountOptions, mountOptions, extraOptions } = ctx;

  const attrs = mergeRecord(
    extraOptions.skipDefaultOptions ? {} : defaultMountOptions.attrs || {},
    mountOptions.attrs || {},
  );

  return patchResultState(ctx, {
    mountOptions: Object.keys(attrs).length > 0 ? { attrs } : {},
  });
};
