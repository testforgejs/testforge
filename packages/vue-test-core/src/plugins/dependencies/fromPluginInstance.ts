import { PLUGIN_INSTANCE_REFERENCE_TYPE } from "../../types.js";
import type {
  PluginInstanceMap,
  PluginInstanceName,
  PluginInstanceReference,
} from "../../types.js";

/**
 * Creates a deferred reference to another managed plugin's runtime instance.
 *
 * The reference is stored in plugin configuration during pipeline processing
 * and resolved later, after plugin dependencies have been ordered and the
 * referenced plugin instance has been created.
 *
 * @param pluginName - Name of the managed plugin whose runtime instance is required.
 * @param resolve - Maps the referenced plugin instance to the configuration value.
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
