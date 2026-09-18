import * as components from "vuetify/components";
import * as directives from "vuetify/directives";

import type { PluginDefaultOptionsFactory } from "@testforgejs/vue-test-core";
import type { VueTestVuetifyOptions } from "./types/types";

/**
 * Creates the default Vuetify options used by TestForge.
 *
 * Registers all Vuetify components and directives so components can be
 * mounted without requiring project-specific Vuetify configuration.
 *
 * @returns A factory that creates the default Vuetify options.
 */
export const defaultOptions: PluginDefaultOptionsFactory<VueTestVuetifyOptions> = () => () => ({
  components,
  directives,
});
