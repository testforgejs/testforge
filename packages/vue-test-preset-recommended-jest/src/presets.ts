import { extendPreset } from "@testforgejs/vue-test-core";
import type { TestFrameworkPresets } from "@testforgejs/vue-test-core";
import { presets as basePresets } from "@testforgejs/vue-test-preset-base";
import { piniaPlugin } from "@testforgejs/vue-test-plugin-pinia";
import { jest } from "@jest/globals";

export const presets = {
  default: extendPreset(basePresets.default, {
    defaults: {
      pinia: piniaPlugin.getDefaultOptions(jest),
    },
  }),

  piniaPreset: extendPreset(basePresets.piniaPreset, {
    defaults: {
      pinia: piniaPlugin.getDefaultOptions(jest),
    },
  }),

  i18nPreset: basePresets.i18nPreset,
  routerPreset: basePresets.routerPreset,
} satisfies TestFrameworkPresets;
