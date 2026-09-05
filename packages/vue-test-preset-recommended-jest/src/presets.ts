import { extendPreset } from "@testforgejs/vue-test-core";
import type { TestFrameworkPresets, PluginOptionsFactory } from "@testforgejs/vue-test-core";
import { defaultPinia, presets as basePresets } from "@testforgejs/vue-test-preset-base";
import type { VueTestPiniaOptions } from "@testforgejs/vue-test-plugin-pinia";
import { jest } from "@jest/globals";

const defaultJestPinia = (() => ({
  ...defaultPinia(),
  createSpy: jest.fn,
})) satisfies PluginOptionsFactory<VueTestPiniaOptions>;

export const presets = {
  default: extendPreset(basePresets.default, {
    defaults: {
      pinia: defaultJestPinia,
    },
  }),

  piniaPreset: extendPreset(basePresets.piniaPreset, {
    defaults: {
      pinia: defaultJestPinia,
    },
  }),

  i18nPreset: basePresets.i18nPreset,
  routerPreset: basePresets.routerPreset,
} satisfies TestFrameworkPresets;
