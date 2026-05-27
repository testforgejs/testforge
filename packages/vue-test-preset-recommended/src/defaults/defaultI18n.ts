import type { VueTestI18nOptions } from "@testforge/vue-test-plugin-i18n";

export const defaultI18n: VueTestI18nOptions = {
  legacy: false,
  locale: "en",
  fallbackLocale: "en",
  messages: {},
  fallbackWarn: false,
  missingWarn: false,
};
