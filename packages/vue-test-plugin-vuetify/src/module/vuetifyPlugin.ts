import { createVuetifyPlugin } from "./createVuetifyPlugin.js";

import type { PluginModule } from "@testforgejs/vue-test-core";
import type { VueTestVuetifyOptions, VuetifyInstance } from "../types/types";

/**
 * Official TestForge integration for Vuetify.
 *
 * Registers the `vuetify` plugin key in the TestForge plugin registry
 * and provides a factory for creating Vuetify runtime instances during
 * component mounting.
 *
 * This plugin belongs to the
 * **Stateful Plugin Factory** category because Vuetify exposes
 * a runtime instance through {@link createVuetify}.
 *
 * @see {@link createVuetifyPlugin}
 */
export const vuetifyPlugin: PluginModule<VuetifyInstance, VueTestVuetifyOptions> = {
  getName: () => "vuetify",

  getDefinition: () => ({
    create: createVuetifyPlugin,
  }),
};
