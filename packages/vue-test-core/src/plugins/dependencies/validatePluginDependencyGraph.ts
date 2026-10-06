import { ERROR_PREFIX } from "../../constants/constants.js";

import type { PluginName } from "../../types";
import type { PluginDependencyGraph } from "./types";

/*
 * Validates a managed plugin dependency graph.
 *
 * Ensures that every referenced dependency is active and that the graph
 * contains neither self-dependencies nor circular dependencies.
 *
 * @throws When a dependency is missing, self-referential, or circular.
 */
export function validatePluginDependencyGraph(graph: PluginDependencyGraph): void {
  validateDependencyTargets(graph);
  validateNoCycles(graph);
}

/*
 * Ensures that every declared dependency exists in the active plugin graph
 * and that plugins do not depend on themselves.
 */
function validateDependencyTargets(graph: PluginDependencyGraph): void {
  for (const [pluginName, dependencies] of graph) {
    for (const dependencyName of dependencies) {
      if (!graph.has(dependencyName)) {
        throw new Error(
          `${ERROR_PREFIX} Plugin "${pluginName}" depends on inactive plugin "${dependencyName}".`,
        );
      }

      if (pluginName === dependencyName) {
        throw new Error(`${ERROR_PREFIX} Plugin "${pluginName}" cannot depend on itself.`);
      }
    }
  }
}

/*
 * Detects circular dependencies using depth-first traversal.
 */
function validateNoCycles(graph: PluginDependencyGraph): void {
  const visited = new Set<PluginName>();
  const visiting = new Set<PluginName>();
  const path: PluginName[] = [];

  const visit = (pluginName: PluginName): void => {
    if (visited.has(pluginName)) {
      return;
    }

    if (visiting.has(pluginName)) {
      throwCircularDependency(pluginName, path);
    }

    visiting.add(pluginName);
    path.push(pluginName);

    const dependencies = graph.get(pluginName);

    if (dependencies) {
      for (const dependencyName of dependencies) {
        visit(dependencyName);
      }
    }

    path.pop();
    visiting.delete(pluginName);
    visited.add(pluginName);
  };

  for (const pluginName of graph.keys()) {
    visit(pluginName);
  }
}

function throwCircularDependency(pluginName: PluginName, path: readonly PluginName[]): never {
  const cycleStart = path.indexOf(pluginName);

  const cycle = [...path.slice(cycleStart), pluginName];

  throw new Error(
    `${ERROR_PREFIX} Circular plugin dependency detected: ${cycle
      .map((name) => `"${name}"`)
      .join(" -> ")}.`,
  );
}
