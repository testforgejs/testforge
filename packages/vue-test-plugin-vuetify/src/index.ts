/**
 * Vuetify integration for TestForge.
 *
 * Provides a managed Vuetify plugin module, typed Vuetify configuration,
 * and the standardized TestForge plugin package contract.
 *
 * Standardized package exports:
 * - `plugin` — alias of {@link vuetifyPlugin}.
 * - `PLUGIN_NAME` — stable identifier for the managed Vuetify plugin.
 * - `PluginOptions` — type-only alias of {@link VueTestVuetifyOptions}.
 *
 * The descriptive `vuetifyPlugin` and `VueTestVuetifyOptions` exports
 * remain available for direct use.
 *
 * @packageDocumentation
 */

import "./types/augmentation.js";

// Plugin module
export { vuetifyPlugin, vuetifyPlugin as plugin } from "./module/vuetifyPlugin.js";

// Plugin identifier
export { VUETIFY_PLUGIN_NAME as PLUGIN_NAME } from "./constants/constants.js";

// Plugin types
export * from "./types/types.js";

// Standardized public options type
export type { VueTestVuetifyOptions as PluginOptions } from "./types/types.js";
