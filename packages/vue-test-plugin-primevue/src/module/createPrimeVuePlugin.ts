import PrimeVue from "primevue/config";
import { createVuePlugin } from "@testforge/vue-test-core";

import type { VueTestPrimeVueOptions, PrimeVueMountPlugin } from "../types/types";

/**
 * Creates a Vue Test Utils compatible PrimeVue plugin tuple.
 *
 * PrimeVue is implemented as an install-based Vue plugin and therefore
 * uses {@link createVuePlugin} instead of {@link createPluginInstance}.
 *
 * @param options PrimeVue configuration options.
 *
 * @returns Vue Test Utils plugin tuple ready for mounting.
 */
export function createPrimeVuePlugin(options: VueTestPrimeVueOptions): PrimeVueMountPlugin {
  return createVuePlugin(PrimeVue, options);
}
