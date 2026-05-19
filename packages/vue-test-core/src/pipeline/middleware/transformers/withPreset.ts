import type { PipelineMiddleware, MountContext } from "../../../types";

import { patchResultState } from "../../state/patchResultState.js";

/*
 * Applies plugin preset before other plugin middlewares.
 */
export const withPreset: PipelineMiddleware = <T extends MountContext>(ctx: T) => {
  const { preset } = ctx;

  if (!preset?.defaults) return ctx;

  return patchResultState(ctx, {
    pluginPresets: { ...preset.defaults },
  });
};
