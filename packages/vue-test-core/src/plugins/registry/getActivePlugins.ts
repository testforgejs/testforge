import type { PluginName, ResolvedPluginOptions, RuntimePluginConfig } from "../../types.js";

export interface ActivePlugin {
  name: PluginName;
  options: RuntimePluginConfig;
}

/*
 * Returns the registered plugins that are active for the current mount.
 *
 * A plugin is considered active when it has an object configuration.
 * Plugins explicitly disabled with `false` are excluded.
 *
 * The order of the provided plugin names is preserved.
 */
export function getActivePlugins(
  pluginNames: Iterable<PluginName>,
  options: ResolvedPluginOptions,
): ActivePlugin[] {
  const activePlugins: ActivePlugin[] = [];

  for (const pluginName of pluginNames) {
    const pluginOptions = options[pluginName];

    if (pluginOptions !== false && pluginOptions && typeof pluginOptions === "object") {
      activePlugins.push({
        name: pluginName,
        options: pluginOptions,
      });
    }
  }

  return activePlugins;
}
