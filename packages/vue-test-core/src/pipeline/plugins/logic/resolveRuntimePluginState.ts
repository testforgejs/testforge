import {
  ERROR_PREFIX,
  PLUGIN_META_KEY,
  SHARED_PLUGIN_INSTANCE_KEY,
} from "../../../constants/constants.js";

import { isPluginInstanceReference } from "../../../plugins/dependencies/isPluginInstanceReference.js";

import type { PluginName, ResolvedPluginConfig, RuntimePluginState } from "../../../types.js";

/*
 * Converts a resolved plugin configuration into runtime state.
 *
 * Responsibilities:
 * - create a shallow copy of the configuration
 * - extract a pre-created plugin instance from symbol-keyed metadata
 * - store the instance under the internal shared-instance key
 * - remove configuration-only metadata
 *
 * Rules:
 * - never mutate the original configuration
 * - reject deferred references used as pre-created instances
 * - preserve all other configuration properties
 */
export function resolveRuntimePluginState(
  pluginName: PluginName,
  config: ResolvedPluginConfig,
): RuntimePluginState {
  const runtimeConfig: RuntimePluginState = {
    ...config,
  };

  const instance = config[PLUGIN_META_KEY]?.instance;

  if (instance !== undefined) {
    if (isPluginInstanceReference(instance)) {
      throw new Error(
        `${ERROR_PREFIX} Plugin "${pluginName}" cannot use fromPluginInstance() ` +
          "as an argument to withPluginInstance(). " +
          "withPluginInstance() requires a pre-created plugin instance.",
      );
    }

    runtimeConfig[SHARED_PLUGIN_INSTANCE_KEY] = instance;
  }

  delete runtimeConfig[PLUGIN_META_KEY];

  return runtimeConfig;
}
