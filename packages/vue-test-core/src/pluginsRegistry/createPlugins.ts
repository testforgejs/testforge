import type { ResolvedPluginOptions, PipelineContext, RuntimeVuePlugin } from "../types";

import { createPluginRegistry } from "./createPluginRegistry.js";

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
): RuntimeVuePlugin[] {
  const plugins: RuntimeVuePlugin[] = [];

  const { preset } = ctx;
  const registry = createPluginRegistry(preset?.manifest);

  for (const [name, definition] of registry.entries()) {
    let pluginOptions = options[name];

    if (pluginOptions !== false && pluginOptions && typeof pluginOptions === "object") {
      if (definition.beforeCreate) {
        pluginOptions = definition.beforeCreate(ctx, pluginOptions);
      }

      const pluginInstance = definition.create(pluginOptions);

      if (definition.afterCreate) {
        definition.afterCreate(pluginInstance, ctx);
      }

      plugins.push(pluginInstance);
    }
  }

  return plugins;
}
