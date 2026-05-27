import type {} from "@testforge/vue-test-core";
import type { VueTestI18nOptions } from "./types";

declare module "@testforge/vue-test-core" {
  interface PluginOptionsMap {
    i18n: VueTestI18nOptions;
  }
}
