import PrimeVue from "primevue/config";
import { createVuePlugin } from "@testforgejs/vue-test-core";

import type { VueTestPrimeVueOptions, PrimeVueMountPlugin } from "../types/types";

/*
 * Creates a Vue Test Utils-compatible PrimeVue 3 mount plugin.
 *
 * PrimeVue 3 uses Vue's install-based plugin API, so TestForge represents it
 * as a plugin/options tuple rather than creating a separate runtime instance.
 */
export function createPrimeVuePlugin(options: VueTestPrimeVueOptions): PrimeVueMountPlugin {
  return createVuePlugin(PrimeVue, options);
}
