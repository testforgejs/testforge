import { extendPreset } from "@testforgejs/vue-test-core";
import type { TestFrameworkPresets, PluginOptionsFactory } from "@testforgejs/vue-test-core";
import { defaultPinia, presets as basePresets } from "@testforgejs/vue-test-preset-base";
import type { VueTestPiniaOptions } from "@testforgejs/vue-test-plugin-pinia";
import { vi } from "vitest";

const defaultVitestPinia = (() => ({
  ...defaultPinia(),
  createSpy: vi.fn,
})) satisfies PluginOptionsFactory<VueTestPiniaOptions>;

export const presets = {
  default: extendPreset(basePresets.default, {
    defaults: {
      pinia: defaultVitestPinia,
    },
  }),

  piniaPreset: extendPreset(basePresets.piniaPreset, {
    defaults: {
      pinia: defaultVitestPinia,
    },
  }),

  i18nPreset: basePresets.i18nPreset,
  routerPreset: basePresets.routerPreset,
} satisfies TestFrameworkPresets;
