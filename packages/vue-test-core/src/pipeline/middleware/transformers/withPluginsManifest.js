import { patchResultState } from "../../state/patchResultState.js";

/**
 * Initializes the state of the plugins based on the manifest of supported plugins.
 * @type {PipelineMiddleware}
 */
export const withPluginsManifest = (ctx) => {
  const { supportedPlugins } = ctx;

  return patchResultState(ctx, {
    plugins: supportedPlugins,
  });
};
