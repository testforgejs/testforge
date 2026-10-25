import type {
  PipelineMiddleware,
  PipelineContext,
  RuntimeContext,
  PluginName,
} from "../../../types";

import { getPluginConfig } from "../logic/getPluginConfig.js";
import { patchPluginState } from "../logic/patchPluginState.js";
import { resolveRuntimePluginState } from "../logic/resolveRuntimePluginState.js";
import { resolveExtraOptions } from "../logic/resolveExtraOptions.js";
import { patchResultState } from "../../state/patchResultState.js";
import { getExtraPluginOptions } from "../logic/getExtraPluginOptions.js";

/*
 * Creates middleware that resolves and applies runtime plugin configuration.
 *
 * Responsibilities:
 * - resolve the effective plugin config across configuration layers
 * - apply explicit plugin disabling
 * - inject runtime-only fields (e.g. shared instances)
 * - normalize enabled plugin configurations into runtime-safe shape
 * - write the resolved plugin state into `ctx.result.plugins`
 */
export function createPluginMiddleware(
  pluginName: PluginName,
): PipelineMiddleware<RuntimeContext, RuntimeContext> {
  return <T extends PipelineContext>(ctx: T): T => {
    const config = getPluginConfig(ctx, pluginName);

    if (config === false) {
      return patchResultState(ctx, {
        plugins: {
          [pluginName]: false,
        },
      });
    }

    const extraOptions = resolveExtraOptions(ctx.extraOptions);
    const runtimeConfig = resolveRuntimePluginState(
      pluginName,
      config,
      getExtraPluginOptions(extraOptions, pluginName),
    );

    return patchPluginState(ctx, pluginName, runtimeConfig);
  };
}
