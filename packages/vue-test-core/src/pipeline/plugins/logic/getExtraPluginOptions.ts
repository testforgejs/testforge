import type { RuntimeExtraOptions, RuntimePluginOption, PluginName } from "../../../types";

/*
 * Extracts runtime plugin override configuration from extraOptions.
 *
 * Why this exists:
 * - Runtime pipeline stores plugin overrides under `extraOptions.plugins`
 * - Centralizes access to plugin overlay state
 * - Hides internal extraOptions structure from consumers
 *
 * Returns:
 * - plugin runtime configuration object
 * - false when plugin is explicitly disabled
 * - undefined when no override exists
 */
export const getExtraPluginOptions = (
  extraOptions: RuntimeExtraOptions,
  name: PluginName,
): RuntimePluginOption | undefined => {
  return extraOptions.plugins?.[name];
};
