/**
 * Vuetify integration for TestForge.
 *
 * Provides a managed Vuetify plugin module, typed Vuetify configuration,
 * and the standardized TestForge plugin package contract.
 *
 * @packageDocumentation
 */

import "./types/augmentation.js";

export { vuetifyPlugin, vuetifyPlugin as plugin } from "./module/vuetifyPlugin.js";
export { VUETIFY_PLUGIN_NAME as PLUGIN_NAME } from "./constants/constants.js";
export * from "./types/types";
