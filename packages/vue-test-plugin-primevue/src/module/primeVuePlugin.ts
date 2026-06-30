import { createPrimeVuePlugin } from "./createPrimeVuePlugin.js";

import type { PluginModule } from "@testforge/vue-test-core";
import type { VueTestPrimeVueOptions, PrimeVueMountPlugin } from "../types/types.js";

export const primeVuePlugin: PluginModule<PrimeVueMountPlugin, VueTestPrimeVueOptions> = {
  getName: () => "primevue",

  getDefinition: () => ({
    create: createPrimeVuePlugin,
  }),
};
