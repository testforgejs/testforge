import { PRIMEVUE_PLUGIN_NAME } from "../constants/constants.js";

import type {} from "@testforgejs/vue-test-core";
import type { VueTestPrimeVueOptions } from "./types.js";

/**
 * TestForge core type augmentation for PrimeVue integration.
 *
 * Registers the public plugin configuration type
 * used by TestForge's managed plugin APIs.
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
