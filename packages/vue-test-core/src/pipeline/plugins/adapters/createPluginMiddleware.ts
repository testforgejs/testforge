import type {
  PipelineMiddleware,
  MountContext,
  PluginName,
  RuntimePluginConfig,
} from "../../../types";

import { getPluginConfig } from "../logic/getPluginConfig.js";
import { patchPluginState } from "../logic/patchPluginState.js";
import { isPluginOverlayObject } from "../../middleware/typeGuards/isPluginOverlayObject.js";

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
        config.__sharedInstance = meta.instance;
      }
    }

    delete config.__meta;

    return patchPluginState(ctx, name, config as RuntimePluginConfig);
  };
}
