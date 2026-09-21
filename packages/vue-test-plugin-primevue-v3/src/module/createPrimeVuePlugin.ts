import PrimeVue from "primevue/config";
import { createVuePlugin } from "@testforgejs/vue-test-core";

import type { VueTestPrimeVueOptions, PrimeVueMountPlugin } from "../types/types";

/**
 * Creates a Vue Test Utils compatible PrimeVue 3 plugin tuple.
 *
 * PrimeVue 3 is implemented as an install-based Vue plugin and therefore
 * uses {@link createVuePlugin} instead of {@link createPluginInstance}.
 *
 * @param options PrimeVue 3 configuration options.
 *
 * @returns Vue Test Utils plugin tuple ready for mounting.
 */
export function createPrimeVuePlugin(options: VueTestPrimeVueOptions): PrimeVueMountPlugin {
  return createVuePlugin(PrimeVue, options);
}
