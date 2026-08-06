import type {} from "@testforgejs/vue-test-core";
import type { VueTestRouterOptions } from "./types";

/**
 * Extending TestForge kernel types for Vue Router integration.
 *
 * This module registers the router configuration in the global plugin map,
 * which ensures strict typing when calling `testComponentFactory`.
 *
 * @module Augmentation
 */
declare module "@testforgejs/vue-test-core" {
  /**
   * The global interface for the TestForge kernel plugin options.
   */
  interface PluginOptionsMap {
    /**
     * Configuration for the `router` plugin.
     * Accepts an object of type {@link VueTestRouterOptions} containing Vue router settings and control hooks.
     *
     * @example
     * ```ts
     * factory({}, {
     *   plugins: {
     *     router: {
     *       history: createMemoryHistory(),
     *       routes: [...]
     *     }
     *   }
     * });
     * ```
     */
    router: VueTestRouterOptions;
  }
}
