import type { PluginOptionsFactory } from "@testforgejs/vue-test-core";
import type { VueTestI18nOptions } from "@testforgejs/vue-test-plugin-i18n";

export const defaultI18n: PluginOptionsFactory<VueTestI18nOptions> = () => ({
  legacy: false,
  locale: "en",
  fallbackLocale: "en",
  messages: {},
  fallbackWarn: false,
  missingWarn: false,
});
