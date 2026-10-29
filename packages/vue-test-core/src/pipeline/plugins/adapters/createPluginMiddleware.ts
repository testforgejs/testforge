import type {
  PipelineMiddleware,
  PipelineContext,
  RuntimeContext,
  PluginName,
} from "../../../types.js";

import { getPluginConfig } from "../logic/getPluginConfig.js";
import { patchResultState } from "../../state/patchResultState.js";

/*
 * Creates middleware that resolves and applies the effective
 * configuration for a single plugin.
 *
 * Responsibilities:
 * - resolve plugin configuration across configuration layers
 * - apply explicit plugin disabling
 * - write the resolved configuration into `ctx.result.plugins`
 *
 * Runtime metadata normalization is handled by a separate
 * pipeline middleware after plugin configuration merging.
 */
export function createPluginMiddleware(
  pluginName: PluginName,
): PipelineMiddleware<RuntimeContext, RuntimeContext> {
  return <T extends PipelineContext>(ctx: T): T => {
    const config = getPluginConfig(ctx, pluginName);

    return patchResultState(ctx, {
      plugins: {
        [pluginName]: config,
      },
    });
  };
}
