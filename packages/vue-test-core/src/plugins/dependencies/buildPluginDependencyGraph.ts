import { ERROR_PREFIX } from "../../constants/constants.js";

import type { PluginName } from "../../types";
import type { PluginDependency, PluginDependencyGraph } from "./types";

/**
 * Builds a dependency graph for the active managed plugins.
 *
 * Each graph entry maps a plugin to the runtime plugin instances
 * required by its effective configuration.
 *
 * Plugins without dependencies are included with an empty dependency set.
 *
 * Graph validation, including missing dependencies, self-dependencies,
 * and dependency cycles, is handled separately.
 *
 * @param pluginNames - Names of the active managed plugins.
 * @param dependencies - Runtime instance dependencies collected from plugin configuration.
 *
 * @returns A graph mapping each plugin to the plugins it depends on.
 */
export function buildPluginDependencyGraph(
  pluginNames: readonly PluginName[],
  dependencies: readonly PluginDependency[],
): PluginDependencyGraph {
  const graph = new Map<PluginName, Set<PluginDependency["dependsOn"]>>();

  for (const pluginName of pluginNames) {
    graph.set(pluginName, new Set());
  }

  for (const { pluginName, dependsOn } of dependencies) {
    const pluginDependencies = graph.get(pluginName);

    if (!pluginDependencies) {
      throw new Error(
        `${ERROR_PREFIX} Cannot register dependencies for unknown plugin "${pluginName}".`,
      );
    }

    pluginDependencies.add(dependsOn);
  }

  return graph;
}
