import { defaultI18n } from "./plugins/defaultI18n.js";
import { defaultPinia } from "./plugins/defaultPinia.js";
import { getDefaultRouter } from "./plugins/defaultRouter.js";
import { piniaPlugin } from "@testforge/vue-test-plugin-pinia";
import { i18nPlugin } from "@testforge/vue-test-plugin-i18n";
import { routerPlugin } from "@testforge/vue-test-plugin-router";

/** @type TestFrameworkPresets */
export const presets = {
  default: {
    manifest: [
      { module: piniaPlugin, enabled: true },
      { module: i18nPlugin, enabled: true },
      { module: routerPlugin, enabled: false },
    ],
    defaults: {
      i18n: defaultI18n,
      pinia: defaultPinia,
      router: getDefaultRouter(),
    },
  },
  i18nPreset: {
    manifest: [{ module: i18nPlugin, enabled: true }],
    defaults: {
      i18n: {
        legacy: false,
        locale: "en",
        fallbackLocale: "en",
        messages: {},
        fallbackWarn: false,
        missingWarn: false,
      },
    },
  },
};
