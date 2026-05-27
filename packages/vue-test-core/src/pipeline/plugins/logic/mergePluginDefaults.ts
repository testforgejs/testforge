import type { PipelineContext, PluginName } from "../../../types";

/*
 * Merges plugin presets with the current plugin configuration.
 *
 * Rules:
 * - Preset acts as a base layer
 * - Existing plugin config has priority over preset
 * - If plugin is explicitly disabled (`false`), it remains disabled
 *
 * This function mutates `ctx.result.plugins[name]`.
 */
export function mergePluginDefaults<T extends PipelineContext>(ctx: T, name: PluginName): T {
  const { result } = ctx;

  const current = result.plugins[name];

  // Explicit disable is sacred
  if (current === false) {
    return ctx;
  }

  result.plugins[name] = {
    ...(result.pluginDefaultsState[name] ?? {}),
    ...(current ?? {}),
  };

  return ctx;
}
