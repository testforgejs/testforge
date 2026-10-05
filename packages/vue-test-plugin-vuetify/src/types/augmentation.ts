import { VUETIFY_PLUGIN_NAME } from "../constants/constants.js";

import type {} from "@testforgejs/vue-test-core";
import type { VueTestVuetifyOptions, VuetifyInstance } from "./types";

/**
 * TestForge core type augmentation for Vuetify integration.
 *
 * Registers the public plugin configuration and runtime instance types
 * used by TestForge's managed plugin APIs.
 */
declare module "@testforgejs/vue-test-core" {
  /**
   * Global map for TestForge plugin configuration options.
   */
  interface PluginOptionsMap {
    /**
     * Configuration accepted by the managed `vuetify` plugin.
     */
    [VUETIFY_PLUGIN_NAME]: VueTestVuetifyOptions;
  }

  /**
   * Global map for managed plugin runtime instances.
   */
  interface PluginInstanceMap {
    /**
     * Vuetify runtime instance created by the managed `vuetify` plugin.
     */
    [VUETIFY_PLUGIN_NAME]: VuetifyInstance;
  }
}
