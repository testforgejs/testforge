import type { PipelineMiddleware, RuntimeContext } from "../../../types";

import { buildPluginOptions } from "../../../presets/utils/buildPluginOptions.js";
import { patchResultState } from "../../state/patchResultState.js";

/*
 * Resolves preset plugin option factories into fresh plugin defaults
 * and injects them into the pipeline result state.
 *
 * Preset defaults act as the base configuration layer for plugins
 * and are later merged by plugin-specific middleware.
 *
 * Each plugin options factory is evaluated for the current pipeline
 * execution to ensure isolated plugin configuration.
 *
 * The resolved preset config is written into `ctx.result.pluginDefaultsState`.
 */
export const withPreset: PipelineMiddleware<RuntimeContext> = (ctx): RuntimeContext => {
  const { preset } = ctx;

  if (!preset?.defaults) return ctx;

  const pluginDefaultsState = Object.fromEntries(
    Object.entries(preset.defaults).map(([pluginName, factory]) => [
      pluginName,
      buildPluginOptions(pluginName, factory),
    ]),
  );

  return patchResultState(ctx, {
    pluginDefaultsState,
  });
};
