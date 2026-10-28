import { createVuetify } from "vuetify";
import { createPluginInstance } from "@testforgejs/vue-test-core";

import type { VuetifyOptions } from "vuetify";
import type { VuetifyInstance, VuetifyRuntimeOptions } from "../types/types";

/*
 * Creates or reuses a managed Vuetify instance.
 *
 * Internal TestForge controls are excluded from the native
 * createVuetify() options by createPluginInstance().
 */
export function createVuetifyPlugin(options: VuetifyRuntimeOptions): VuetifyInstance {
  return createPluginInstance<VuetifyInstance, VuetifyOptions>(createVuetify, options);
}
