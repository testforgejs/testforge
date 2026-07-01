import { describe, it, expect, vi } from "vitest";
import { createPrimeVuePlugin } from "../createPrimeVuePlugin.js";
import { createVuePlugin } from "@testforge/vue-test-core";
import PrimeVue from "primevue/config";

vi.mock("@testforge/vue-test-core", () => ({
  createVuePlugin: vi.fn(() => ["mock-plugin", {}]),
}));

describe("createPrimeVuePlugin", () => {
  it("should call createVuePlugin with PrimeVue plugin and options", () => {
    const options = {
      ripple: true,
    };

    const result = createPrimeVuePlugin(options);

    expect(createVuePlugin).toHaveBeenCalledWith(PrimeVue, options);

    expect(result).toEqual(["mock-plugin", {}]);
  });
});
