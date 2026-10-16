import { PLUGIN_EXPOSE, SHARED_PLUGIN_INSTANCE_KEY } from "../../constants/constants.js";

import { exposeInstance } from "./exposeInstance.js";

import type { RuntimePluginOptions } from "../../types";

/*
 * Creates or reuses a managed plugin instance.
 *
 * Internal TestForge options are excluded from the native
 * plugin factory options.
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
