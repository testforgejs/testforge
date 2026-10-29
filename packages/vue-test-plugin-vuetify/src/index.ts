/**
 * Vuetify integration for TestForge.
 *
 * Provides a managed Vuetify plugin module, typed Vuetify configuration,
 * and the standardized TestForge plugin package contract.
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
