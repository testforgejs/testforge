import type { PluginName } from "../../types.js";
import type { PluginDependencyGraph } from "./types.js";

/**
 * Sorts a validated plugin dependency graph into plugin creation order.
 *
 * Dependencies are placed before the plugins that depend on them.
 *
 * The graph must be validated with `validatePluginDependencyGraph`
 * before it is passed to this function.
 *
 * @param graph - A validated managed plugin dependency graph.
 *
 * @returns Plugin names ordered so that dependencies are created first.
 */
export function sortPluginDependencyGraph(graph: PluginDependencyGraph): readonly PluginName[] {
  const visited = new Set<PluginName>();
  const sorted: PluginName[] = [];

  const visit = (pluginName: PluginName): void => {
    if (visited.has(pluginName)) {
      return;
    }

    // Mark before traversing dependencies.
    // Cycle detection belongs to validatePluginDependencyGraph.
    visited.add(pluginName);

    const dependencies = graph.get(pluginName);

    if (dependencies) {
      for (const dependencyName of dependencies) {
        visit(dependencyName);
      }
    }

    sorted.push(pluginName);
  };

  for (const pluginName of graph.keys()) {
    visit(pluginName);
  }

  return Object.freeze(sorted);
}
