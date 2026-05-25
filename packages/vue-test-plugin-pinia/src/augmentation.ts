import type {} from "@testforge/vue-test-core";
import type { PiniaPluginOptions } from "./types";

declare module "@testforge/vue-test-core" {
  interface PluginOptionsMap {
    pinia: PiniaPluginOptions;
  }
}
