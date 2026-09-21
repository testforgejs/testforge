import { describe, it, expectTypeOf } from "vitest";

import type { PluginOptionsMap } from "@testforgejs/vue-test-core";
import type { VueTestPrimeVueOptions } from "../types";

import "../augmentation";

describe("PrimeVue Types Augmentation", () => {
  it("should register VueTestPrimeVueOptions under 'primevueV3' key", () => {
    expectTypeOf<PluginOptionsMap["primevueV3"]>().toEqualTypeOf<VueTestPrimeVueOptions>();
  });
});
