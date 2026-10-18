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
 * Resolves a plugin configuration into a runtime-ready state.
 *
 * Responsibilities:
 * - Creates a shallow copy of the incoming configuration
 * - Extracts a pre-created plugin instance from overlay metadata
 * - Stores the instance under an internal symbol-keyed property
 * - Removes `__meta` from the runtime configuration
 *
 * Rules:
 * - Never mutates the original configuration
 * - Ignores overlays that are `false` or `undefined`
 * - Rejects plugin instance references in `__meta.instance`
 * - Treats `__meta` as internal pipeline metadata
 *
 * Runtime transformation:
 *
 * Config:
 * {
 *   locale: "en"
 * }
 *
 * Overlay:
 * {
 *   __meta: {
 *     instance: i18nInstance
 *   }
 * }
 *
 * Result:
 * {
 *   locale: "en",
 *   [SHARED_PLUGIN_INSTANCE_KEY]: i18nInstance
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
