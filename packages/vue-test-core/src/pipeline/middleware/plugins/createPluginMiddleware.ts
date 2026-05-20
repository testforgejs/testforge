import type {
  PipelineMiddleware,
  MountContext,
  PluginName,
  PluginConfigObject,
} from "../../../types";

import { getPluginConfig } from "./getPluginConfig.js";
import { patchPluginState } from "./patchPluginState.js";
import { isPluginOverlayObject } from "../validation/typeGuards/isPluginOverlayObject.js";

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

    const overlay = ctx.extraOptions[name];

    if (isPluginOverlayObject(overlay)) {
      const meta = overlay.__meta;

      if (meta?.instance) {
        (config as any).__sharedInstance = meta.instance;
      }
    }

    delete config.__meta;

    return patchPluginState(ctx, name, config as PluginConfigObject);
  };
}
