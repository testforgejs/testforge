import type {} from "@testforge/vue-test-core";
import type { I18nPluginOptions } from "./types";

declare module "@testforge/vue-test-core" {
  interface PluginOptionsMap {
    i18n: I18nPluginOptions;
  }
}
