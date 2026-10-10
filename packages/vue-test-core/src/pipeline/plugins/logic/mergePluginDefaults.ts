import type { PipelineContext, PluginName } from "../../../types";

/*
 * Shallow-merges plugin preset defaults with the resolved runtime configuration.
 *
 * Rules:
 * - Preset defaults provide the base configuration.
 * - Runtime configuration takes precedence over matching preset properties.
 * - Nested values are replaced, not recursively merged.
 * - Explicitly disabled plugins (`false`) remain disabled.
 *
 * Creates a new top-level plugin configuration without cloning nested values.
 * Updates `ctx.result.plugins[name]` in place.
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
