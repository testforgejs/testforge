import type {} from "@testforge/vue-test-core";
import type { VueTestPiniaOptions } from "./types";

declare module "@testforge/vue-test-core" {
  interface PluginOptionsMap {
    pinia: VueTestPiniaOptions;
  }
}
