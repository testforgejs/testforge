import { mergeResult } from "../helpers/mergeResult.js";

/**
 * Applies plugin preset before other plugin middlewares.
 *
 * @type {PipelineMiddleware}
 */
export const withPreset = (ctx) => {
  const { preset = {} } = ctx;

  if (!preset?.defaults) return ctx;

  return mergeResult(ctx, {
    pluginPresets: { ...preset.defaults },
  });
};
