import { ROUTER_PLUGIN_NAME } from "../constants/constants.js";

import type {} from "@testforgejs/vue-test-core";
import type { Router } from "vue-router";
import type { VueTestRouterOptions } from "./types";

/**
 * TestForge core type augmentation for Vue Router integration.
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
     * Configuration accepted by the managed `router` plugin.
     */
    [ROUTER_PLUGIN_NAME]: VueTestRouterOptions;
  }

  /**
   * Global map for managed plugin runtime instances.
   */
  interface PluginInstanceMap {
    /**
     * Runtime Vue Router instance created by the managed `router` plugin.
     */
    [ROUTER_PLUGIN_NAME]: Router;
  }
}
