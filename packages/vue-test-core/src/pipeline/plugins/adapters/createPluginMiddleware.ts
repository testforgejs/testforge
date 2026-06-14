import type {
  PipelineMiddleware,
  PipelineContext,
  PluginOptionsReadyContext,
  PluginName,
} from "../../../types";

import { getPluginConfig } from "../logic/getPluginConfig.js";
import { patchPluginState } from "../logic/patchPluginState.js";
import { resolveRuntimePluginState } from "../logic/resolveRuntimePluginState.js";
import { resolveExtraOptions } from "../logic/resolveExtraOptions";
import { getExtraPluginOptions } from "../logic/getExtraPluginOptions";

/*
 * Creates middleware that resolves and applies runtime plugin configuration.
 *
 * Responsibilities:
 * - resolve the effective plugin config across configuration layers
 * - inject runtime-only fields (e.g. shared instances)
 * - normalize the config into runtime-safe shape
 * - write the resolved config into `ctx.result.plugins`
 */
export function createPluginMiddleware(
  name: PluginName,
): PipelineMiddleware<PluginOptionsReadyContext, PluginOptionsReadyContext> {
  return <T extends PipelineContext>(ctx: T): T => {
    const config = getPluginConfig(ctx, name);

    if (!config) return ctx;

    const extraOptions = resolveExtraOptions(ctx.extraOptions);
    const runtimeConfig = resolveRuntimePluginState(
      config,
      getExtraPluginOptions(extraOptions, name),
    );

    return patchPluginState(ctx, name, runtimeConfig);
  };
}
