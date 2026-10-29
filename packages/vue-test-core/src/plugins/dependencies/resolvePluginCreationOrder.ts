import { buildPluginDependencyGraph } from "./buildPluginDependencyGraph.js";
import { collectPluginDependencies } from "./collectPluginDependencies.js";
import { sortPluginDependencyGraph } from "./sortPluginDependencyGraph.js";
import { validatePluginDependencyGraph } from "./validatePluginDependencyGraph.js";
import { validatePluginInstanceReferenceTargets } from "./validatePluginInstanceReferenceTargets.js";

import type { createPluginRegistry } from "../registry/createPluginRegistry.js";
import type { getActivePlugins } from "../registry/getActivePlugins.js";
import type { PluginName } from "../../types.js";

/*
 * Resolves the creation order of active plugins based on their
 * instance dependencies.
 *
 * Collects dependencies from effective plugin configurations,
 * validates the dependency graph and reference targets,
 * and returns plugin names in topological order.
 *
 * Throws if the dependency configuration is invalid.
 */
export function resolvePluginCreationOrder(
  activePlugins: ReturnType<typeof getActivePlugins>,
  registry: ReturnType<typeof createPluginRegistry>,
): readonly PluginName[] {
  const activePluginNames = activePlugins.map(({ name }) => name);

  const dependencies = activePlugins.flatMap(({ name, options }) =>
    collectPluginDependencies(name, options),
  );

  const dependencyGraph = buildPluginDependencyGraph(activePluginNames, dependencies);

  validatePluginDependencyGraph(dependencyGraph);
  validatePluginInstanceReferenceTargets(dependencies, registry);

  return sortPluginDependencyGraph(dependencyGraph);
}
