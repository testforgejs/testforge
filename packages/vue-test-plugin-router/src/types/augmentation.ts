import type {} from "@testforge/vue-test-core";
import type { RouterPluginOptions } from "./types";

declare module "@testforge/vue-test-core" {
  interface PluginOptionsMap {
    router: RouterPluginOptions;
  }
}
