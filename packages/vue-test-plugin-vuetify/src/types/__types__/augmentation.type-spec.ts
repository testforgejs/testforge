import { describe, it, expectTypeOf } from "vitest";

import type { PluginOptionsMap } from "@testforgejs/vue-test-core";
import type { VueTestVuetifyOptions } from "../types";
import "../augmentation";

describe("Vuetify Types Augmentation", () => {
  it("should register VueTestVuetifyOptions under 'vuetify' key when augmentation file is imported", () => {
    expectTypeOf<PluginOptionsMap["vuetify"]>().toEqualTypeOf<VueTestVuetifyOptions>();
  });
});
