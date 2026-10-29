import { I18N_PLUGIN_NAME } from "../constants/constants.js";

import type {} from "@testforgejs/vue-test-core";
import type { I18n } from "vue-i18n";
import type { VueTestI18nOptions } from "./types.js";

/**
 * TestForge core type augmentation for Vue I18n integration.
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
     * Configuration accepted by the managed `i18n` plugin.
     */
    [I18N_PLUGIN_NAME]: VueTestI18nOptions;
  }

  /**
   * Global map for managed plugin runtime instances.
   */
  interface PluginInstanceMap {
    /**
     * Runtime Vue I18n instance created by the managed `i18n` plugin.
     */
    [I18N_PLUGIN_NAME]: I18n;
  }
}
