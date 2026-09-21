import type { PluginDefaultOptionsFactory } from "@testforgejs/vue-test-core";
import type { VueTestPrimeVueOptions } from "./types/types";

/**
 * Creates the default PrimeVue 3 options used by TestForge.
 *
 * Uses an empty configuration because PrimeVue 3 provides functional
 * defaults without requiring any project-specific configuration.
 *
 * @returns A factory that creates the default PrimeVue 3 options.
 */
export const defaultOptions: PluginDefaultOptionsFactory<VueTestPrimeVueOptions> = () => () => ({});
