/**
 * PrimeVue integration for TestForge.
 *
 * Provides a managed PrimeVue plugin module, typed PrimeVue configuration,
 * and the standardized TestForge plugin package contract.
 *
 * @packageDocumentation
 */

import "./types/augmentation.js";

export { primeVuePlugin, primeVuePlugin as plugin } from "./module/primeVuePlugin.js";
export { PRIMEVUE_PLUGIN_NAME as PLUGIN_NAME } from "./constants/constants.js";
export * from "./types/types";
