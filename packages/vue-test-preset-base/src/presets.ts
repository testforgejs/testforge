import type { TestFrameworkPresets } from "@testforgejs/vue-test-core";

import { defaultI18n } from "./defaults/defaultI18n.js";
import { defaultPinia } from "./defaults/defaultPinia.js";
import { defaultRouter } from "./defaults/defaultRouter.js";
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
      router: defaultRouter,
    },
  },

  piniaPreset: {
    manifest: [{ module: piniaPlugin, enabled: true }],
    defaults: {
      pinia: defaultPinia,
    },
  },

  i18nPreset: {
    manifest: [{ module: i18nPlugin, enabled: true }],
    defaults: {
      i18n: defaultI18n,
    },
  },

  routerPreset: {
    manifest: [{ module: routerPlugin, enabled: true }],
    defaults: {
      router: defaultRouter,
    },
  },
} satisfies TestFrameworkPresets;
