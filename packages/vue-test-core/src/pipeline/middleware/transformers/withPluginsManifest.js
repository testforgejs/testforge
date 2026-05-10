import { mergeResult } from "../../state/mergeResult.js";

/**
 * Initializes the state of the plugins based on the manifest of supported plugins.
 * @type {PipelineMiddleware}
 */
export const withPluginsManifest = (ctx) => {
  const { supportedPlugins } = ctx;

  return mergeResult(ctx, {
    plugins: supportedPlugins,
  });
};
