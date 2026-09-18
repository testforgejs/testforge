import type { PluginDefaultOptionsFactory } from "@testforgejs/vue-test-core";
import type { VueTestPrimeVueOptions } from "./types/types";

/**
 * Creates the default PrimeVue options used by TestForge.
 *
 * Enables unstyled mode to provide a functional, project-independent
 * configuration without requiring a project-specific PrimeVue theme.
 *
 * @returns A factory that creates the default PrimeVue options.
 */
export const defaultOptions: PluginDefaultOptionsFactory<VueTestPrimeVueOptions> = () => () => ({
  unstyled: true,
});
