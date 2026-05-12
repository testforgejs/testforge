import { patchResultState } from "../../state/patchResultState.js";

/**
 * Applies plugin preset before other plugin middlewares.
 *
 * @type {PipelineMiddleware}
 */
export const withPreset = (ctx) => {
  const { preset = {} } = ctx;

  if (!preset?.defaults) return ctx;

  return patchResultState(ctx, {
    pluginPresets: { ...preset.defaults },
  });
};
