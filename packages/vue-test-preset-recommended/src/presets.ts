import { extendPreset } from "@testforgejs/vue-test-core";
import { presets as basePresets } from "@testforgejs/vue-test-preset-base";
import { piniaPlugin } from "@testforgejs/vue-test-plugin-pinia";
import type { TestFrameworkPresets } from "@testforgejs/vue-test-core";
import { vi } from "vitest";

export const presets = {
  default: extendPreset(basePresets.default, {
    defaults: {
      pinia: piniaPlugin.getDefaultOptions(vi),
    },
  }),

  piniaPreset: extendPreset(basePresets.piniaPreset, {
    defaults: {
      pinia: piniaPlugin.getDefaultOptions(vi),
    },
  }),

  i18nPreset: basePresets.i18nPreset,
  routerPreset: basePresets.routerPreset,
} satisfies TestFrameworkPresets;
