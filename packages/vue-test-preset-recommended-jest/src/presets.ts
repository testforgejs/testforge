import { extendPreset } from "@testforgejs/vue-test-core";
import { presets as basePresets } from "@testforgejs/vue-test-preset-base";
import { jest } from "@jest/globals";
import type { TestFrameworkPresets } from "@testforgejs/vue-test-core";

export const presets = {
  default: extendPreset(basePresets.default, {
    defaults: {
      pinia: {
        ...basePresets.default.defaults.pinia,
        createSpy: jest.fn,
      },
    },
  }),

  piniaPreset: extendPreset(basePresets.piniaPreset, {
    defaults: {
      pinia: {
        ...basePresets.piniaPreset.defaults.pinia,
        createSpy: jest.fn,
      },
    },
  }),

  i18nPreset: basePresets.i18nPreset,
  routerPreset: basePresets.routerPreset,
} satisfies TestFrameworkPresets;
