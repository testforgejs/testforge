import { PRIMEVUE_PLUGIN_NAME } from "../constants/constants.js";

import type {} from "@testforgejs/vue-test-core";
import type { VueTestPrimeVueOptions } from "./types";

/**
 * TestForge core type augmentation for PrimeVue integration.
 *
 * Registers the `primevue` configuration key inside the global
 * plugin options map, enabling strict typing and IDE autocompletion
 * when configuring PrimeVue in component tests.
 *
 * @module PrimeVueAugmentation
 */
declare module "@testforgejs/vue-test-core" {
  /**
   * Global map for TestForge plugin configuration options.
   */
  interface PluginOptionsMap {
    /**
     * Configuration accepted by the managed `primevue` plugin.
     */
    [PRIMEVUE_PLUGIN_NAME]: VueTestPrimeVueOptions;
  }
}
