import { PRIMEVUE_V3_PLUGIN_NAME } from "../constants.js";

import type {} from "@testforgejs/vue-test-core";
import type { VueTestPrimeVueOptions } from "./types";

/**
 * Extends TestForge kernel types for PrimeVue 3 integration.
 *
 * Registers the `primevueV3` configuration key inside the global
 * plugin options map, enabling strict typing and IDE autocompletion
 * when configuring PrimeVue 3 in component tests.
 *
 * @module Augmentation
 */
declare module "@testforgejs/vue-test-core" {
  /**
   * Global TestForge plugin configuration registry.
   */
  interface PluginOptionsMap {
    /**
     * Configuration for the `primevueV3` plugin.
     *
     * Accepts standard {@link VueTestPrimeVueOptions},
     * which correspond directly to PrimeVue 3 configuration options.
     *
     * @example
     * ```ts
     * factory({}, {
     *   plugins: {
     *     primevueV3: {
     *       ripple: true
     *     }
     *   }
     * })
     * ```
     */
    [PRIMEVUE_V3_PLUGIN_NAME]: VueTestPrimeVueOptions;
  }
}
