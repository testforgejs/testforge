import { piniaPlugin, PLUGIN_NAME as PINIA_PLUGIN_NAME } from "@testforgejs/vue-test-plugin-pinia";
import { i18nPlugin, PLUGIN_NAME as I18N_PLUGIN_NAME } from "@testforgejs/vue-test-plugin-i18n";
import {
  routerPlugin,
  PLUGIN_NAME as ROUTER_PLUGIN_NAME,
} from "@testforgejs/vue-test-plugin-router";

import type { TestFrameworkPresets } from "@testforgejs/vue-test-core";

export const presets = {
  default: {
    manifest: [
      { module: piniaPlugin, enabled: true },
      { module: i18nPlugin, enabled: true },
      { module: routerPlugin, enabled: false },
    ],
    defaults: {
      [I18N_PLUGIN_NAME]: i18nPlugin.getDefaultOptions(),
      [PINIA_PLUGIN_NAME]: piniaPlugin.getDefaultOptions(),
      [ROUTER_PLUGIN_NAME]: routerPlugin.getDefaultOptions(),
    },
  },

  piniaPreset: {
    manifest: [{ module: piniaPlugin, enabled: true }],
    defaults: {
      [PINIA_PLUGIN_NAME]: piniaPlugin.getDefaultOptions(),
    },
  },

  i18nPreset: {
    manifest: [{ module: i18nPlugin, enabled: true }],
    defaults: {
      [I18N_PLUGIN_NAME]: i18nPlugin.getDefaultOptions(),
    },
  },

  routerPreset: {
    manifest: [{ module: routerPlugin, enabled: true }],
    defaults: {
      [ROUTER_PLUGIN_NAME]: routerPlugin.getDefaultOptions(),
    },
  },
} satisfies TestFrameworkPresets;
