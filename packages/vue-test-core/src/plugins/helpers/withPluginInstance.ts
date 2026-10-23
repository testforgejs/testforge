import { PLUGIN_META_KEY } from "../../constants/constants.js";

/*
 * Configures TestForge to reuse an existing managed plugin instance.
 *
 * The provided instance is used instead of creating a new one.
 *
 * @example
 * ```ts
 * factory({}, {
 *   plugins: {
 *     pinia: {
 *       ...withPluginInstance(existingPinia),
 *     },
 *   },
 * });
 * ```
 */
export function withPluginInstance<TInstance>(instance: TInstance) {
  return {
    [PLUGIN_META_KEY]: {
      instance,
    },
  };
}
