import type {} from "@testforge/vue-test-core";
import type { VueTestVuetifyOptions } from "./types";

/**
 * Extending TestForge kernel types for Vuetify integration.
 *
 * This module registers the Vuetify configuration in the global
 * plugin map, enabling full autocompletion and type safety
 * when configuring TestForge factories.
 *
 * @module Augmentation
 */
declare module "@testforge/vue-test-core" {
  /**
   * The global interface for TestForge plugin options.
   */
  interface PluginOptionsMap {
    /**
     * Configuration for the `vuetify` plugin.
     *
     * Accepts an object of type {@link VueTestVuetifyOptions}
     * containing Vuetify configuration and TestForge control hooks.
     *
     * @example
     * ```ts
     * factory({}, {
     *   plugins: {
     *     vuetify: {
     *       theme: {
     *         defaultTheme: "dark"
     *       }
     *     }
     *   }
     * });
     * ```
     */
    vuetify: VueTestVuetifyOptions;
  }
}
