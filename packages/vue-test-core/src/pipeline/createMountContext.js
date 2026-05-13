import { getActivePreset } from "../utils/getActivePreset.js";
import { createSupportedPluginsState } from "../utils/createSupportedPluginsState.js";

/**
 * Creates initial mount context for pipeline processing.
 *
 * @param {CreateMountContextParams} params
 * @returns {MountContext}
 */
export function createMountContext({
  defaultMountOptions = {},
  mountOptions = {},
  extraOptions = {},
  presets,
}) {
  const activePreset = getActivePreset(extraOptions, presets);
  const supportedPlugins = createSupportedPluginsState(activePreset);

  return {
    defaultMountOptions,
    mountOptions,
    extraOptions,
    supportedPlugins,
    preset: activePreset,

    result: {
      mountOptions: {},
      global: {},
      pluginPresets: {},
      plugins: {},
    },
  };
}
