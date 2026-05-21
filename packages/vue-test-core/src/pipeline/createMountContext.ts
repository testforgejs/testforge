import type { MountContext, CreateMountContextParams } from "../types";

import { getActivePreset } from "../utils/getActivePreset.js";
import { createSupportedPluginsState } from "../utils/createSupportedPluginsState.js";

/*
 * Creates the initial pipeline context for component mounting.
 *
 * Responsibilities:
 * - resolve the active preset
 * - initialize supported plugin state
 * - prepare empty runtime result containers
 * - normalize incoming mount parameters
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
