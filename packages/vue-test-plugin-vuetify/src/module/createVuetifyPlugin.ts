import { createVuetify } from "vuetify";
import { createPluginInstance } from "@testforge/vue-test-core";

import type { VueTestVuetifyOptions, VuetifyInstance } from "../types/types";

/*
 * Factory for creating the Vuetify plugin instance.
 */
export function createVuetifyPlugin(options: VueTestVuetifyOptions): VuetifyInstance {
  return createPluginInstance(createVuetify, options);
}
