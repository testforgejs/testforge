import { createVuetifyPlugin } from "./createVuetifyPlugin.js";
import { defaultOptions } from "../defaults.js";
import { VUETIFY_PLUGIN_NAME } from "../constants/constants.js";

import type { PluginModuleWithDefaults } from "@testforgejs/vue-test-core";
import type { VueTestVuetifyOptions, VuetifyInstance } from "../types/types";

/**
 * Managed Vuetify plugin module for TestForge.
 *
 * Provides the runtime definition for creating Vuetify instances
 * and exposes the default configuration used by TestForge-managed presets.
 */
export const vuetifyPlugin: PluginModuleWithDefaults<VuetifyInstance, VueTestVuetifyOptions> = {
  getName: () => VUETIFY_PLUGIN_NAME,

  getDefinition: () => ({
    create: createVuetifyPlugin,
  }),

  getDefaultOptions: defaultOptions,
};
