import { createVuetifyPlugin } from "./createVuetifyPlugin.js";
import { defaultOptions } from "../defaults.js";
import { VUETIFY_PLUGIN_NAME } from "../constants.js";

import type { PluginModuleWithDefaults } from "@testforgejs/vue-test-core";
import type { VueTestVuetifyOptions, VuetifyInstance } from "../types/types";

/**
 * Official TestForge integration for Vuetify.
 *
 * Registers the `vuetify` plugin key in the TestForge plugin registry
 * and provides a factory for creating Vuetify runtime instances during
 * component mounting.
 *
 * This plugin belongs to the
 * **Stateful Plugin Factory** category because each configuration
 * creates a dedicated Vuetify runtime instance.
 *
 * @see {@link createVuetifyPlugin}
 */
export const vuetifyPlugin: PluginModuleWithDefaults<VuetifyInstance, VueTestVuetifyOptions> = {
  getName: () => VUETIFY_PLUGIN_NAME,

  getDefinition: () => ({
    create: createVuetifyPlugin,
  }),

  getDefaultOptions: defaultOptions,
};
