import type { TestFrameworkPresets } from "@testforgejs/vue-test-core";
import type { VueTestI18nOptions } from "@testforgejs/vue-test-plugin-i18n";

import { defaultI18n } from "./defaults/defaultI18n.js";
import { defaultPinia } from "./defaults/defaultPinia.js";
import { getDefaultRouter } from "./defaults/defaultRouter.js";
import { piniaPlugin } from "@testforgejs/vue-test-plugin-pinia";
import { i18nPlugin } from "@testforgejs/vue-test-plugin-i18n";
import { routerPlugin } from "@testforgejs/vue-test-plugin-router";

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
      } satisfies VueTestI18nOptions,
    },
  },
} satisfies TestFrameworkPresets;
