import { describe, it, expectTypeOf } from "vitest";

import type { PluginOptionsMap } from "@testforgejs/vue-test-core";
import type { VueTestPiniaOptions } from "../types";
import "../augmentation";

describe("Pinia Types Augmentation", () => {
  it("should register VueTestPiniaOptions under 'pinia' key when augmentation file is imported", () => {
    // Checking for a one-to-one match
    expectTypeOf<PluginOptionsMap["pinia"]>().toEqualTypeOf<VueTestPiniaOptions>();
  });
});
