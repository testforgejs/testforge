import type { PipelineMiddleware, MountContext } from "../../../types";

import { patchResultState } from "../../state/patchResultState.js";

/*
 * Injects preset plugin defaults into the pipeline result state.
 *
 * Preset defaults act as the base configuration layer for plugins
 * and are later merged by plugin-specific middleware.
 *
 * The resolved preset config is written into `ctx.result.pluginPresets`.
 */
export const withPreset: PipelineMiddleware = <T extends MountContext>(ctx: T) => {
  const { preset } = ctx;

  if (!preset?.defaults) return ctx;

  return patchResultState(ctx, {
    pluginPresets: { ...preset.defaults },
  });
};
