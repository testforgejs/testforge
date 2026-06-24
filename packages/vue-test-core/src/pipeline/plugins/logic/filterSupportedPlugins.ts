import type { ResolvedPluginOptions, SupportedPluginsMap } from "../../../types";

export function filterSupportedPlugins(
  plugins: ResolvedPluginOptions = {},
  supported: SupportedPluginsMap,
): ResolvedPluginOptions {
  return Object.fromEntries(
    Object.entries(plugins).filter(([name]) => supported[name] !== undefined),
  );
}
