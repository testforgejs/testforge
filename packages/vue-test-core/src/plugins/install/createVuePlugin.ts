import { ERROR_PREFIX } from "../../constants/constants.js";

import type { Plugin } from "vue";
import type { RuntimePluginOptions } from "../../types";

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
 * - `__sharedInstance`
 * - `expose()`
 *
 * Stateful plugin factories such as Router, Pinia or vue-i18n should use
 * `createPluginInstance()` instead.
 */
export function createVuePlugin<TPlugin extends Plugin, TOptions extends object>(
  plugin: TPlugin,
  options: RuntimePluginOptions<[TPlugin, TOptions], TOptions>,
): [TPlugin, TOptions] {
  if (options.__sharedInstance) {
    throw new Error(
      `${ERROR_PREFIX} __sharedInstance is not supported for non-instance Vue plugins. ` +
        "Shared instances are only supported for stateful plugin factories such as Router, Pinia or vue-i18n.",
    );
  }

  if (options.expose) {
    throw new Error(
      `${ERROR_PREFIX} expose() is not supported for non-instance Vue plugins because they do not produce a runtime instance. ` +
        "The expose callback is only available for stateful plugin factories such as Router, Pinia or vue-i18n.",
    );
  }

  return [plugin, options];
}
