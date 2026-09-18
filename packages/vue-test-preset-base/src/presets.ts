import { piniaPlugin } from "@testforgejs/vue-test-plugin-pinia";
import { i18nPlugin } from "@testforgejs/vue-test-plugin-i18n";
import { routerPlugin } from "@testforgejs/vue-test-plugin-router";

import type { TestFrameworkPresets } from "@testforgejs/vue-test-core";

export const presets = {
  default: {
    manifest: [
      { module: piniaPlugin, enabled: true },
      { module: i18nPlugin, enabled: true },
      { module: routerPlugin, enabled: false },
    ],
    defaults: {
      i18n: i18nPlugin.getDefaultOptions(),
      pinia: piniaPlugin.getDefaultOptions(),
      router: routerPlugin.getDefaultOptions(),
    },
  },

  piniaPreset: {
    manifest: [{ module: piniaPlugin, enabled: true }],
    defaults: {
      pinia: piniaPlugin.getDefaultOptions(),
    },
  },

  i18nPreset: {
    manifest: [{ module: i18nPlugin, enabled: true }],
    defaults: {
      i18n: i18nPlugin.getDefaultOptions(),
    },
  },

  routerPreset: {
    manifest: [{ module: routerPlugin, enabled: true }],
    defaults: {
      router: routerPlugin.getDefaultOptions(),
    },
  },
} satisfies TestFrameworkPresets;
