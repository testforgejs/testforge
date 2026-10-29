import type { ResolvedPluginOptions, SupportedPluginsMap } from "../../../types";

/*
 * Removes plugins that are not registered in the supported plugins map.
 *
 * Preserves registered plugins regardless of their enabled state.
 */
export function filterSupportedPlugins(
  plugins: ResolvedPluginOptions = {},
  supported: SupportedPluginsMap,
): ResolvedPluginOptions {
  return Object.fromEntries(
    Object.entries(plugins).filter(([name]) => supported[name] !== undefined),
  );
}
