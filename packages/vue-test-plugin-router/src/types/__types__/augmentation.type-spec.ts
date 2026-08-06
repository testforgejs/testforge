import { describe, it, expectTypeOf } from "vitest";

import type { PluginOptionsMap } from "@testforgejs/vue-test-core";
import type { VueTestRouterOptions } from "../types";
import "../augmentation";

describe("Router Types Augmentation", () => {
  it("should register VueTestRouterOptions under 'router' key when augmentation file is imported", () => {
    expectTypeOf<PluginOptionsMap["router"]>().toEqualTypeOf<VueTestRouterOptions>();
  });
});
