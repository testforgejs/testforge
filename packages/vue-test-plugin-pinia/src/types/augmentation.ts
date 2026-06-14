import type {} from "@testforge/vue-test-core";
import type { VueTestPiniaOptions } from "./types";

/**
 * Extending TestForge kernel types for Pinia integration.
 *
 * This module registers the Pinia configuration in the global plugin map,
 * which ensures strict typing of the `pinia` property within `plugins`.
 *
 * @module PiniaAugmentation
 */
declare module "@testforge/vue-test-core" {
  /**
   * The global interface for the TestForge kernel plugin options.
   */
  interface PluginOptionsMap {
    /**
     * Configuration for the `pinia` plugin.
     * Accepts an object of type {@link VueTestPiniaOptions}, which controls the behavior of the stores in tests.
     */
    pinia: VueTestPiniaOptions;
  }
}
