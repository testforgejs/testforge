import type { ResolvedPluginConfig, PluginOverlay, RuntimePluginConfig } from "../../../types";

import { isPluginOverlayObject } from "../../middleware/typeGuards/isPluginOverlayObject.js";

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
export function resolveRuntimePluginConfig(
  config: ResolvedPluginConfig,
  overlay?: PluginOverlay,
): RuntimePluginConfig {
  const runtimeConfig: RuntimePluginConfig = {
    ...config,
  };

  if (isPluginOverlayObject(overlay)) {
    const meta = overlay.__meta;

    if (meta?.instance) {
      runtimeConfig.__sharedInstance = meta.instance;
    }
  }

  delete runtimeConfig.__meta;

  return runtimeConfig;
}
