import { ERROR_PREFIX } from "../../constants/constants.js";
import { buildPluginDependencyGraph } from "../dependencies/buildPluginDependencyGraph.js";
import { collectPluginDependencies } from "../dependencies/collectPluginDependencies.js";
import { resolvePluginInstanceReferences } from "../dependencies/resolvePluginInstanceReferences.js";
import { sortPluginDependencyGraph } from "../dependencies/sortPluginDependencyGraph.js";
import { validatePluginDependencyGraph } from "../dependencies/validatePluginDependencyGraph.js";
import { validatePluginInstanceReferenceTargets } from "../dependencies/validatePluginInstanceReferenceTargets.js";
import { createPluginRegistry } from "./createPluginRegistry.js";
import { getActivePlugins } from "./getActivePlugins.js";

import type { MountPlugin, PluginName, PipelineContext, ResolvedPluginOptions } from "../../types";

/*
 * Creates Vue plugins used for mounting components in tests.
 * Initializes plugins based on the passed configurations.
 * Uses a fail-fast approach: if plugin creation fails, the test stops immediately.
 *
 * Vue plugins are intentionally treated as runtime-erased values.
 *
 * Different Vue ecosystem plugins expose incompatible TypeScript shapes
 * even though they are installable by Vue Test Utils.
 *
 * The framework delegates runtime compatibility to Vue / VTU
 * instead of enforcing structural typing at the framework layer.
 *
 * Each plugin can be configured via an options object.
 * Passing `false` disables the plugin entirely.
 *
 * Plugins may also expose an optional `expose(instance)` callback.
 * If provided, the created plugin instance is passed to this callback,
 * allowing tests to access plugin internals directly.
 *
 * This is useful for advanced testing scenarios where direct interaction
 * with plugin runtime state or APIs is required.
 */
export function createPlugins(
  options: ResolvedPluginOptions = {},
  ctx: PipelineContext,
): MountPlugin[] {
  const plugins: MountPlugin[] = [];

  const { preset } = ctx;
  const registry = createPluginRegistry(preset?.manifest);

  const activePlugins = getActivePlugins(registry.getNames(), options);

  const activePluginNames = activePlugins.map(({ name }) => name);

  const dependencies = activePlugins.flatMap(({ name, options: pluginOptions }) =>
    collectPluginDependencies(name, pluginOptions),
  );

  const dependencyGraph = buildPluginDependencyGraph(activePluginNames, dependencies);

  validatePluginDependencyGraph(dependencyGraph);

  validatePluginInstanceReferenceTargets(dependencies, registry);

  const creationOrder = sortPluginDependencyGraph(dependencyGraph);

  const activePluginsByName = new Map(activePlugins.map((plugin) => [plugin.name, plugin]));

  const createdPluginInstances = new Map<PluginName, unknown>();

  for (const name of creationOrder) {
    const definition = registry.get(name);

    if (!definition) {
      throw new Error(`${ERROR_PREFIX} Cannot create unknown plugin "${name}".`);
    }

    const activePlugin = activePluginsByName.get(name);

    if (!activePlugin) {
      throw new Error(`${ERROR_PREFIX} Active plugin "${name}" is missing during creation.`);
    }

    let pluginOptions = resolvePluginInstanceReferences(
      activePlugin.options,
      createdPluginInstances,
    );

    if (definition.beforeCreate) {
      pluginOptions = definition.beforeCreate(ctx, pluginOptions);
    }

    const createdPlugin = definition.create(pluginOptions);

    if (definition.supportsInstanceReferences) {
      createdPluginInstances.set(name, createdPlugin);
    }

    if (definition.afterCreate) {
      definition.afterCreate(createdPlugin, ctx);
    }

    plugins.push(createdPlugin);
  }

  return plugins;
}
