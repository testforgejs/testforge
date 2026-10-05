import { PINIA_PLUGIN_NAME } from "../constants/constants.js";

import type {} from "@testforgejs/vue-test-core";
import type { TestingPinia } from "@pinia/testing";
import type { VueTestPiniaOptions } from "./types";

/**
 * TestForge core type augmentation for Pinia integration.
 *
 * Registers the public plugin configuration and runtime instance types
 * used by TestForge's managed plugin APIs.
 */
declare module "@testforgejs/vue-test-core" {
  /**
   * The global interface for the TestForge kernel plugin options.
   */
  interface PluginOptionsMap {
    /**
     * Configuration for the `pinia` plugin.
     * Accepts an object of type {@link VueTestPiniaOptions}, which controls the behavior of the stores in tests.
     */
    [PINIA_PLUGIN_NAME]: VueTestPiniaOptions;
  }

  /**
   * Registers the testing Pinia runtime instance type.
   */
  interface PluginInstanceMap {
    /**
     * Testing Pinia instance created by the managed `pinia` plugin.
     */
    [PINIA_PLUGIN_NAME]: TestingPinia;
  }
}
