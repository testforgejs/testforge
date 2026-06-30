import type {} from "@testforge/vue-test-core";
import type { VueTestPrimeVueOptions } from "./types";

declare module "@testforge/vue-test-core" {
  interface PluginOptionsMap {
    primevue: VueTestPrimeVueOptions;
  }
}
