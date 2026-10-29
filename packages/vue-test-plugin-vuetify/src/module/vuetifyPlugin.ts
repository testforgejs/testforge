import { createVuetifyPlugin } from "./createVuetifyPlugin.js";
import { defaultOptions } from "../defaults.js";
import { VUETIFY_PLUGIN_NAME } from "../constants/constants.js";

import type { PluginModuleWithDefaults } from "@testforgejs/vue-test-core";
import type { VueTestVuetifyOptions, VuetifyInstance } from "../types/types.js";

/**
 * Managed Vuetify plugin module for TestForge.
 *
 * Provides the runtime definition for creating or reusing Vuetify
 * instances and exposes a default configuration factory
 * that presets can explicitly opt into.
 */
export const vuetifyPlugin: PluginModuleWithDefaults<VuetifyInstance, VueTestVuetifyOptions> = {
  getName: () => VUETIFY_PLUGIN_NAME,

  getDefinition: () => ({
    create: createVuetifyPlugin,
    supportsInstanceReferences: true,
  }),

  getDefaultOptions: defaultOptions,
};
