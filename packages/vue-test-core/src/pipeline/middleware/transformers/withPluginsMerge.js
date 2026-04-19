import { mergePluginPresets } from "../helpers/mergePluginPresets.js";

/** @type {PipelineMiddleware} */
export const withPluginsMerge = (ctx) => {
  const { supportedPlugins } = ctx;

  Object.keys(supportedPlugins).forEach((name) => {
    mergePluginPresets(ctx, name);
  });

  return ctx;
};
