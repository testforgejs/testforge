/**
 * PrimeVue 3 integration for TestForge.
 *
 * Provides a managed PrimeVue 3 plugin module, typed PrimeVue 3 configuration,
 * and the standardized TestForge plugin package contract.
 *
 * @packageDocumentation
 */

import "./types/augmentation.js";

// Plugin module
export { primeVuePlugin, primeVuePlugin as plugin } from "./module/primeVuePlugin.js";

// Plugin identifier
export { PRIMEVUE_V3_PLUGIN_NAME as PLUGIN_NAME } from "./constants/constants.js";

// Plugin types
export * from "./types/types";

// Standardized public options type
export type { VueTestPrimeVueOptions as PluginOptions } from "./types/types";
