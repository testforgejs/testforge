import { createPluginRegistry } from "./createPluginRegistry.js";

/**
 * Creates Vue plugins used for mounting components in tests.
 *
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
 *
 * @template TPlugins
 * @param {PluginOptions} [options={}]
 * @param {MountContext} ctx
 * @returns {any[]}
 */
export function createPlugins(options = {}, ctx) {
  const plugins = [];

  const { preset = {} } = ctx;
  /** @type {PluginRegistry<PluginDefinition>} */
  const registry = createPluginRegistry(preset?.manifest);

  // Iterate through the factories—that is defense
  // Anything not found in pluginFactories will be ignored.
  for (const [name, definition] of registry.entries()) {
    let pluginOptions = options[name];

    if (pluginOptions !== false && pluginOptions && typeof pluginOptions === "object") {
      // --- beforeCreate ---
      if (definition.beforeCreate) {
        pluginOptions = definition.beforeCreate(ctx, pluginOptions);
      }
      // --- create ---
      const pluginInstance = definition.create(pluginOptions);
      // --- afterCreate ---
      if (definition.afterCreate) {
        definition.afterCreate(pluginInstance, ctx);
      }

      plugins.push(pluginInstance);
    }
  }

  return plugins;
}
