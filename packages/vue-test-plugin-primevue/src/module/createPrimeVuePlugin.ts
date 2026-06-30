import PrimeVue from "primevue/config";
import { createVuePlugin } from "@testforge/vue-test-core";

import type { VueTestPrimeVueOptions, PrimeVueMountPlugin } from "../types/types";

/*
 * Factory for creating PrimeVue plugin entry for VTU.
 */
export function createPrimeVuePlugin(options: VueTestPrimeVueOptions): PrimeVueMountPlugin {
  return createVuePlugin(PrimeVue, options);
}
