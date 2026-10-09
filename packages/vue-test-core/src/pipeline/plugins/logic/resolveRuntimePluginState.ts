import {
  ERROR_PREFIX,
  PLUGIN_META_KEY,
  SHARED_PLUGIN_INSTANCE_KEY,
} from "../../../constants/constants.js";
import { isPluginInstanceReference } from "../../../plugins/dependencies/isPluginInstanceReference.js";
import { isPluginOverlayObject } from "../../middleware/typeGuards/isPluginOverlayObject.js";

import type {
  PluginName,
  ResolvedPluginConfig,
  PluginOverlay,
  RuntimePluginState,
} from "../../../types";

/*
 * Resolves a user/plugin configuration into a runtime-ready plugin config.
 *
 * Responsibilities:
 * - Creates a safe runtime copy of the incoming config
 * - Injects `__sharedInstance` from overlay metadata when present
 * - Removes internal `__meta` field before plugin factory execution
 *
 * Rules:
 * - Never mutates the original config
 * - Ignores overlay when it is `false` or `undefined`
 * - `__meta` is treated as internal pipeline metadata only
 *
 * Runtime transformation:
 *
 * BEFORE:
 * {
 *   locale: "en",
 *   __meta: {
 *     instance: i18nInstance
 *   }
 * }
 *
 * AFTER:
 * {
 *   locale: "en",
 *   __sharedInstance: i18nInstance
 * }
 */
export function resolveRuntimePluginState(
  pluginName: PluginName,
  config: ResolvedPluginConfig,
  overlay?: PluginOverlay,
): RuntimePluginState {
  const runtimeConfig: RuntimePluginState = {
    ...config,
  };

  if (isPluginOverlayObject(overlay)) {
    const instance = overlay[PLUGIN_META_KEY]?.instance;

    if (instance !== undefined) {
      if (isPluginInstanceReference(instance)) {
        throw new Error(
          `${ERROR_PREFIX} Plugin "${pluginName}" cannot use fromPluginInstance() as "${PLUGIN_META_KEY}.instance". ` +
            `"${PLUGIN_META_KEY}.instance" must contain a pre-created plugin instance.`,
        );
      }

      runtimeConfig[SHARED_PLUGIN_INSTANCE_KEY] = instance;
    }
  }

  delete runtimeConfig[PLUGIN_META_KEY];

  return runtimeConfig;
}
