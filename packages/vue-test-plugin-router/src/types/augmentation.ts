import type {} from "@testforge/vue-test-core";
import type { VueTestRouterOptions } from "./types";

declare module "@testforge/vue-test-core" {
  interface PluginOptionsMap {
    router: VueTestRouterOptions;
  }
}
