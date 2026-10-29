import {
  ERROR_PREFIX,
  PLUGIN_EXPOSE,
  SHARED_PLUGIN_INSTANCE_KEY,
} from "../../constants/constants.js";

import type { Plugin } from "vue";
import type { RuntimePluginOptions } from "../../types.js";

/*
 * Creates a Vue Test Utils compatible plugin tuple for install-based Vue plugins.
 *
 * Intended for plugins implemented as:
 *
 * - install objects (`{ install(app) {} }`)
 * - install functions (`(app) => {}`)
 *
 * Unlike `createPluginInstance()`, this helper does not create or manage
 * runtime instances and therefore does not support:
 *
 * - shared plugin instances
 * - instance capturing
 *
 * Stateful plugin factories such as Router, Pinia or vue-i18n should use
 * `createPluginInstance()` instead.
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
