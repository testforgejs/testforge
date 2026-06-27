import type {} from "@testforge/vue-test-core";
import type { VueTestVuetifyOptions } from "./types";

declare module "@testforge/vue-test-core" {
  interface PluginOptionsMap {
    vuetify: VueTestVuetifyOptions;
  }
}
