import type {
  PipelineMiddleware,
  PipelineContext,
  RuntimeContext,
  SupportedPluginsMap,
  PluginName,
  ResolvedPluginOptions,
} from "../../../types";

import { isPluginOverlayObject } from "../../middleware/typeGuards/isPluginOverlayObject.js";
import { patchResultState } from "../../state/patchResultState.js";
import { resolveRuntimePluginState } from "../logic/resolveRuntimePluginState.js";

/*
 * Normalizes resolved plugin configurations into runtime state.
 *
 * Runs after all plugin configuration merging has completed.
 *
 * Responsibilities:
 * - iterate over supported plugins
 * - preserve disabled plugin states
 * - extract and validate pre-created plugin instances
 * - remove configuration-only metadata
 * - write normalized runtime configurations
 */
export function withResolvedPluginInstances(
  supportedPlugins: SupportedPluginsMap,
): PipelineMiddleware<RuntimeContext, RuntimeContext> {
  return <T extends PipelineContext>(ctx: T): T => {
    const updates: ResolvedPluginOptions = {};

    for (const pluginName of Object.keys(supportedPlugins) as PluginName[]) {
      const config = ctx.result.plugins[pluginName];

      // Disabled or absent plugins do not require normalization.
      if (!isPluginOverlayObject(config)) {
        continue;
      }

      updates[pluginName] = resolveRuntimePluginState(pluginName, config);
    }

    return patchResultState(ctx, {
      plugins: updates,
    });
  };
}
