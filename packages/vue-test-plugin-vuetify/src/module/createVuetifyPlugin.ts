import { createVuetify } from "vuetify";
import { createPluginInstance } from "@testforgejs/vue-test-core";

import type { VueTestVuetifyOptions, VuetifyInstance } from "../types/types";

/*
 * Creates a Vuetify instance.
 *
 * Extracted into a separate factory to simplify testing and mocking.
 */
export function createVuetifyPlugin(options: VueTestVuetifyOptions): VuetifyInstance {
  return createPluginInstance(createVuetify, options);
}
