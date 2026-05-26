import type { ResolvedPluginOptions, PipelineContext } from "../types";
import type { Plugin } from "vue";

import { createPluginRegistry } from "./createPluginRegistry.js";

/*
 * Creates Vue plugins used for mounting components in tests.
 * Initializes plugins based on the passed configurations.
 * Uses a fail-fast approach: if the plugin factory fails, the test stops immediately.
 *
 * Each plugin can be configured via an options object.
 * Passing `false` disables the plugin entirely.
 *
 * Supported plugins:
 * - Pinia (testing pinia)
 * - vue-i18n
 * - Vue Router
 *
 * Plugins also support an optional `expose(instance)` callback.
 * If provided, the created plugin instance will be passed to this
 * callback, allowing tests to access it.
 *
 * This is useful when tests need to interact with plugin internals,
 * for example:
 *
 * - change locale in vue-i18n
 * - trigger router navigation
 * - inspect Pinia state
 */
export function createPlugins(options: ResolvedPluginOptions = {}, ctx: PipelineContext): Plugin[] {
  const plugins: Plugin[] = [];

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
