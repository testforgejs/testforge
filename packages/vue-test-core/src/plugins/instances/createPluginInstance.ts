import { PLUGIN_EXPOSE, SHARED_PLUGIN_INSTANCE_KEY } from "../../constants/constants.js";
import { exposeInstance } from "./exposeInstance.js";

import type { RuntimePluginOptions } from "../../types.js";

/**
 * Creates or reuses a managed plugin instance.
 *
 * Reuses the supplied shared instance when available; otherwise invokes
 * the native plugin factory after removing TestForge's instance capture
 * and shared-instance controls from the options.
 *
 * Exposes the resulting instance through the configured capture callback,
 * whether the instance was newly created or reused.
 *
 * The input options object is not mutated.
 *
 * Intended for factory-based integrations. Use `createVuePlugin()`
 * for install-based plugins.
 *
 * @typeParam TInstance - The type of the managed plugin instance.
 * @typeParam TOptions - The native options accepted by the plugin factory.
 *
 * @param factory - The native plugin factory used to create a new instance.
 * @param options - The resolved plugin options, including optional
 * TestForge instance controls.
 *
 * @returns The newly created or reused plugin instance.
 */
export function createPluginInstance<TInstance, TOptions extends object>(
  factory: (options: TOptions) => TInstance,
  options: RuntimePluginOptions<TInstance, TOptions>,
): TInstance {
  const {
    [PLUGIN_EXPOSE]: _expose,
    [SHARED_PLUGIN_INSTANCE_KEY]: sharedInstance,
    ...nativeOptions
  } = options;

  const instance = sharedInstance ?? factory(nativeOptions as TOptions);

  exposeInstance(instance, options);

  return instance;
}
