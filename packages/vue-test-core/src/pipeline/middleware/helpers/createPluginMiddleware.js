import { getPluginConfig } from "./getPluginConfig.js";
import { mergePlugin } from "./mergePlugin.js";

/**
 * Creates middleware for a plugin that supports defaults and instances.
 *
 * @param {string} name - Plugin name (pinia, i18n, router)
 * @returns {PipelineMiddleware}
 */
export function createPluginMiddleware(name) {
  /** @type {PipelineMiddleware} */
  return (ctx) => {
    const config = getPluginConfig(ctx, name);

    if (!config) return ctx;

    const meta = ctx.extraOptions[name]?.__meta;

    if (meta?.instance) {
      config.__sharedInstance = meta.instance;
    }

    // Delete __meta from the config so it doesn't end up in the actual plugin factory
    delete config.__meta;

    return mergePlugin(ctx, name, config);
  };
}
