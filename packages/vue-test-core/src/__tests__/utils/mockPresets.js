import { createMemoryHistory } from "vue-router";
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
      i18n: {
        legacy: false,
        locale: "en",
        fallbackLocale: "en",
        messages: {},
        fallbackWarn: false,
        missingWarn: false,
      },
      pinia: {
        initialState: {},
        stubActions: false,
        mocks: {},
        mockStores: null,
        createSpy: undefined,
      },
      router: {
        history: createMemoryHistory(),
        routes: [{ path: "/", component: { render: () => null } }],
      },
    },
  },
  lightweightPreset: {
    manifest: [
      { module: piniaPlugin, enabled: true },
      { module: i18nPlugin, enabled: true },
    ],
    defaults: {
      i18n: {
        locale: "en",
        messages: {},
      },
      pinia: {
        initialState: {},
        stubActions: false,
        mocks: {},
      },
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
  i18nDisabledPreset: {
    manifest: [{ module: i18nPlugin, enabled: false }],
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
  routerPreset: {
    manifest: [{ module: routerPlugin, enabled: true }],
    defaults: {
      router: {
        history: createMemoryHistory(),
        routes: [{ path: "/", component: { render: () => null } }],
      },
    },
  },
};
