import type { PipelineMiddleware, MountContext, PluginName } from "../../../types";

import { getPluginConfig } from "../logic/getPluginConfig.js";
import { patchPluginState } from "../logic/patchPluginState.js";
import { resolveRuntimePluginState } from "../logic/resolveRuntimePluginState.js";

/*
 * Creates middleware that resolves and applies runtime plugin configuration.
 *
 * Responsibilities:
 * - resolve the effective plugin config across configuration layers
 * - inject runtime-only fields (e.g. shared instances)
 * - normalize the config into runtime-safe shape
 * - write the resolved config into `ctx.result.plugins`
 */
export function createPluginMiddleware(name: PluginName): PipelineMiddleware {
  return <T extends MountContext>(ctx: T): T => {
    const config = getPluginConfig(ctx, name);

    if (!config) return ctx;

    const extraOptions = ctx.extraOptions as Record<string, any>;
    const runtimeConfig = resolveRuntimePluginState(config, extraOptions[name]);

    return patchPluginState(ctx, name, runtimeConfig);
  };
}
