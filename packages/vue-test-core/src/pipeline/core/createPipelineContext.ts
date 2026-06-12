import type { PipelineContext, CreatePipelineContextParams } from "../../types";

import { getActivePreset } from "../../utils/getActivePreset.js";
import { createSupportedPluginsState } from "../../utils/createSupportedPluginsState.js";

/*
 * Creates the initial pipeline context for component mounting.
 *
 * Responsibilities:
 * - resolve the active preset
 * - initialize supported plugin state
 * - prepare empty runtime result containers
 * - normalize incoming mount parameters
 */
export function createPipelineContext(params: CreatePipelineContextParams): PipelineContext {
  const { defaultMountOptions = {}, mountOptions = {}, extraOptions = {}, presets = {} } = params;

  const activePreset = getActivePreset(presets, extraOptions);
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
      pluginDefaultsState: {},
      plugins: {},
    },
  };
}
