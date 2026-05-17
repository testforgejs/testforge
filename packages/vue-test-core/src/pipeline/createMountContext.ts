import type { MountContext, CreateMountContextParams } from "../types";

import { getActivePreset } from "../utils/getActivePreset.js";
import { createSupportedPluginsState } from "../utils/createSupportedPluginsState.js";

/*
Creates initial mount context for pipeline processing.
*/
export function createMountContext(params: CreateMountContextParams): MountContext {
  const { defaultMountOptions = {}, mountOptions = {}, extraOptions = {}, presets = {} } = params;

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
