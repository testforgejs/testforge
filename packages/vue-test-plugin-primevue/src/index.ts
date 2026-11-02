/**
 * PrimeVue integration for TestForge.
 *
 * Provides an install-based PrimeVue plugin module, typed configuration,
 * and the standardized TestForge plugin package contract.
 *
 * Standardized package exports:
 * - `plugin` — alias of {@link primeVuePlugin}.
 * - `PLUGIN_NAME` — stable identifier for the managed PrimeVue plugin.
 * - `PluginOptions` — type-only alias of {@link VueTestPrimeVueOptions}.
 *
 * The descriptive `primeVuePlugin` and `VueTestPrimeVueOptions` exports
 * remain available for direct use.
 *
 * @packageDocumentation
 */

import "./types/augmentation.js";

// Plugin module
export { primeVuePlugin, primeVuePlugin as plugin } from "./module/primeVuePlugin.js";

// Plugin identifier
export { PRIMEVUE_PLUGIN_NAME as PLUGIN_NAME } from "./constants/constants.js";

// Plugin types
export * from "./types/types.js";

// Standardized public options type
export type { VueTestPrimeVueOptions as PluginOptions } from "./types/types.js";
