import {
  ERROR_PREFIX,
  PLUGIN_EXPOSE,
  SHARED_PLUGIN_INSTANCE_KEY,
} from "../../constants/constants.js";

import type { Plugin } from "vue";
import type { RuntimePluginOptions } from "../../types.js";

/**
 * Creates a Vue Test Utils-compatible tuple for an install-based Vue plugin.
 *
 * Supports Vue plugins implemented as install objects or install functions.
 * Returns the plugin and its options without invoking the plugin's
 * installation function.
 *
 * Unlike `createPluginInstance()`, this helper does not create or manage
 * runtime instances. Shared-instance reuse and instance capture are
 * not supported.
 *
 * The original options object is returned unchanged.
 *
 * @typeParam TPlugin - The installable Vue plugin type.
 * @typeParam TOptions - The options passed to the plugin during installation.
 *
 * @param plugin - The Vue plugin to install.
 * @param options - The plugin installation options.
 *
 * @returns A `[plugin, options]` tuple compatible with Vue Test Utils.
 *
 * @throws {Error} If shared-instance reuse or instance capture is requested.
 */
export function createVuePlugin<TPlugin extends Plugin, TOptions extends object>(
  plugin: TPlugin,
  options: RuntimePluginOptions<[TPlugin, TOptions], TOptions>,
): [TPlugin, TOptions] {
  if (options[SHARED_PLUGIN_INSTANCE_KEY]) {
    throw new Error(
      `${ERROR_PREFIX} Shared instances are not supported for non-instance Vue plugins. ` +
        "Shared instances are only supported for stateful plugin factories such as Router, Pinia or vue-i18n.",
    );
  }

  if (options[PLUGIN_EXPOSE]) {
    throw new Error(
      `${ERROR_PREFIX} Instance capture is not supported for non-instance Vue plugins because they do not produce a runtime instance. ` +
        "Instance capture is only available for stateful plugin factories such as Router, Pinia or vue-i18n.",
    );
  }

  return [plugin, options];
}
