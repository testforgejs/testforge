import type {} from "@testforge/vue-test-core";
import type { VueTestPrimeVueOptions } from "./types";

/**
 * Extends TestForge kernel types for PrimeVue integration.
 *
 * Registers the `primevue` configuration key inside the global
 * plugin options map, enabling strict typing and IDE autocompletion
 * when configuring PrimeVue in component tests.
 *
 * @module Augmentation
 */
declare module "@testforge/vue-test-core" {
  /**
   * Global TestForge plugin configuration registry.
   */
  interface PluginOptionsMap {
    /**
     * Configuration for the `primevue` plugin.
     *
     * Accepts standard {@link VueTestPrimeVueOptions}
     * which correspond directly to PrimeVue configuration options.
     *
     * @example
     * ```ts
     * factory({}, {
     *   plugins: {
     *     primevue: {
     *       ripple: true
     *     }
     *   }
     * })
     * ```
     */
    primevue: VueTestPrimeVueOptions;
  }
}
