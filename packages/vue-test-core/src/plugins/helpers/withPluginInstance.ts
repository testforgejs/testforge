import { PLUGIN_META_KEY } from "../../constants/constants.js";

import type { PluginInstanceInput } from "../../types.js";

/**
 * Configures TestForge to reuse an existing managed plugin instance.
 *
 * The provided instance is used instead of creating a new one.
 * The same instance is reused without cloning or resetting its state.
 *
 * Intended for factory-based plugins that support managed instance reuse.
 * Install-based plugins do not support shared instances.
 *
 * @typeParam TInstance - The type of the managed plugin instance.
 *
 * @param instance - The existing plugin instance to reuse.
 *
 * @returns Plugin configuration containing the shared-instance reference.
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
export function withPluginInstance<TInstance>(instance: TInstance): PluginInstanceInput<TInstance> {
  return {
    [PLUGIN_META_KEY]: {
      instance,
    },
  };
}
