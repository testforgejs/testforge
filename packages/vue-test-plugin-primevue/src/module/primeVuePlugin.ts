import { createPrimeVuePlugin } from "./createPrimeVuePlugin.js";

import type { PluginModule } from "@testforgejs/vue-test-core";
import type { VueTestPrimeVueOptions, PrimeVueMountPlugin } from "../types/types";

/**
 * Official TestForge integration module for PrimeVue.
 *
 * Registers PrimeVue in the TestForge plugin pipeline and exposes
 * the `primevue` configuration key for presets and mount options.
 */
export const primeVuePlugin: PluginModule<PrimeVueMountPlugin, VueTestPrimeVueOptions> = {
  /**
   * Returns the plugin identifier used in TestForge configuration.
   *
   * @returns The plugin registration key (`"primevue"`).
   */
  getName: () => "primevue",

  /**
   * Returns the PrimeVue plugin lifecycle definition.
   *
   * @returns Plugin lifecycle hooks consumed by the TestForge kernel.
   */
  getDefinition: () => ({
    create: createPrimeVuePlugin,
  }),
};
