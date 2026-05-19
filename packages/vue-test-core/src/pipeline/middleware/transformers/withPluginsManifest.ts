import type { PipelineMiddleware, MountContext } from "../../../types";

import { patchResultState } from "../../state/patchResultState.js";

/*
 * Initializes the state of the plugins based on the manifest of supported plugins.
 */
export const withPluginsManifest: PipelineMiddleware = <T extends MountContext>(ctx: T) => {
  const { supportedPlugins } = ctx;

  return patchResultState(ctx, {
    plugins: supportedPlugins,
  });
};
