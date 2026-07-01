import { createVuetify } from "vuetify";
import { createPluginInstance } from "@testforge/vue-test-core";

import type { VueTestVuetifyOptions, VuetifyInstance } from "../types/types";

/**
 * Creates a Vuetify runtime instance for the TestForge plugin pipeline.
 *
 * This factory delegates instance creation to
 * {@link createPluginInstance}, which provides:
 *
 * - support for `expose()`
 * - support for `__meta.instance`
 * - automatic shared-instance reuse
 *
 * @param options - Vuetify configuration merged with TestForge plugin controls.
 *
 * @returns A configured {@link VuetifyInstance}.
 */
export function createVuetifyPlugin(options: VueTestVuetifyOptions): VuetifyInstance {
  return createPluginInstance(createVuetify, options);
}
