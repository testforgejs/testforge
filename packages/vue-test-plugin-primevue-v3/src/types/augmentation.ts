import { PRIMEVUE_V3_PLUGIN_NAME } from "../constants/constants.js";

import type {} from "@testforgejs/vue-test-core";
import type { VueTestPrimeVueOptions } from "./types";

/**
 * TestForge core type augmentation for PrimeVue 3 integration.
 *
 * Registers the `primevueV3` configuration key inside the global
 * plugin options map, enabling strict typing and IDE autocompletion
 * when configuring PrimeVue 3 in component tests.
 *
 * @module PrimeVue3Augmentation
 */
declare module "@testforgejs/vue-test-core" {
  /**
   * Global map for TestForge plugin configuration options.
   */
  interface PluginOptionsMap {
    /**
     * Configuration accepted by the managed `primevueV3` plugin.
     */
    [PRIMEVUE_V3_PLUGIN_NAME]: VueTestPrimeVueOptions;
  }
}
