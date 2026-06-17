import type { PipelineMiddleware, RuntimeContext } from "../../../types";

import { patchResultState } from "../../state/patchResultState.js";

/*
 * Injects preset plugin defaults into the pipeline result state.
 *
 * Preset defaults act as the base configuration layer for plugins
 * and are later merged by plugin-specific middleware.
 *
 * The resolved preset config is written into `ctx.result.pluginDefaultsState`.
 */
export const withPreset: PipelineMiddleware<RuntimeContext> = (ctx): RuntimeContext => {
  const { preset } = ctx;

  if (!preset?.defaults) return ctx;

  return patchResultState(ctx, {
    pluginDefaultsState: { ...preset.defaults },
  });
};
