import type { PipelineMiddleware, MountContext, PluginName } from "../../../types";

import { getPluginConfig } from "../logic/getPluginConfig.js";
import { patchPluginState } from "../logic/patchPluginState.js";
import { resolveRuntimePluginConfig } from "../logic/resolveRuntimePluginConfig";

/**
 * Creates middleware for a plugin that supports defaults and instances.
 *
 * @param {string} name - Plugin name (pinia, i18n, router)
 * @returns {PipelineMiddleware}
 */
export function createPluginMiddleware(name: PluginName): PipelineMiddleware {
  return <T extends MountContext>(ctx: T): T => {
    const config = getPluginConfig(ctx, name);

    if (!config) return ctx;

    const runtimeConfig = resolveRuntimePluginConfig(config, ctx.extraOptions[name]);

    return patchPluginState(ctx, name, runtimeConfig);
  };
}
