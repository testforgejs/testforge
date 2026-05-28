import type { PipelineMiddleware, PipelineContext } from "../../../types";

import { patchResultState } from "../../state/patchResultState.js";

/*
 * Initializes the base plugin support state from the preset manifest.
 *
 * This middleware defines which plugins are available in the current
 * pipeline execution and establishes the initial `ctx.result.plugins`
 * structure before plugin configuration merging begins.
 */
export const withPluginsManifest: PipelineMiddleware = <T extends PipelineContext>(ctx: T) => {
  const plugins = Object.fromEntries(
    Object.entries(ctx.supportedPlugins).map(([name, enabled]) => [name, enabled ? {} : false]),
  );

  return patchResultState(ctx, {
    plugins,
  });
};
