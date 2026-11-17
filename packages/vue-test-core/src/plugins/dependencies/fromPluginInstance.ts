import { PLUGIN_INSTANCE_REFERENCE_TYPE } from "../../types.js";
import type {
  PluginInstanceMap,
  PluginInstanceName,
  PluginInstanceReference,
} from "../../types.js";

/**
 * Creates a deferred reference to a managed plugin's runtime instance.
 *
 * The reference can be used in another managed plugin's configuration.
 * The pipeline resolves it after ordering plugin dependencies and
 * creating the referenced plugin instance.
 *
 * The resolver receives the referenced instance and produces the
 * configuration value that replaces the deferred reference.
 *
 * @typeParam TPluginName - The name of the registered managed plugin
 * whose instance is referenced.
 * @typeParam TResult - The type of the value produced by the resolver.
 *
 * @param pluginName - The name of the managed plugin whose instance is required.
 * @param resolve - Maps the referenced instance to a configuration value.
 *
 * @returns A deferred plugin instance reference.
 *
 * @example
 * ```ts
 * fromPluginInstance(I18N_PLUGIN_NAME, (i18n) =>
 *   createVueI18nAdapter({
 *     i18n,
 *     useI18n,
 *   }),
 * );
 * ```
 */
export function fromPluginInstance<TPluginName extends PluginInstanceName, TResult>(
  pluginName: TPluginName,
  resolve: (instance: PluginInstanceMap[TPluginName]) => TResult,
): PluginInstanceReference<TPluginName, TResult> {
  return Object.freeze({
    __type: PLUGIN_INSTANCE_REFERENCE_TYPE,
    pluginName,
    resolve,
  });
}
