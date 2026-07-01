import { describe, it, expectTypeOf } from "vitest";

import type { PluginOptionsMap } from "@testforge/vue-test-core";
import type { VueTestPrimeVueOptions } from "../types";

import "../augmentation";

describe("PrimeVue Types Augmentation", () => {
  it("should register VueTestPrimeVueOptions under 'primevue' key", () => {
    expectTypeOf<PluginOptionsMap["primevue"]>().toEqualTypeOf<VueTestPrimeVueOptions>();
  });
});
