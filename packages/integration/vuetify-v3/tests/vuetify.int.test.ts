/* @vitest-environment happy-dom */
import { describe, expect, it, vi } from "vitest";
import { createTestFramework } from "@testforgejs/vue-test-core";
import VuetifyFixture from "../src/VuetifyFixture.vue";
import { testComponentFactory } from "./setup.js";

import type { PresetDefinition } from "@testforgejs/vue-test-core";

describe("Vuetify 3 integration", () => {
  const factory = testComponentFactory(VuetifyFixture);

  it("should mount Vuetify components", () => {
    const wrapper = factory();

    expect(wrapper.find("input").exists()).toBe(true);
    expect(wrapper.find("button").exists()).toBe(true);

    expect(wrapper.get('[data-testid="vuetify-context"]').text()).toBe("true");
  });

  it("should support interaction with Vuetify components", async () => {
    const wrapper = factory();

    await wrapper.get("input").setValue("TestForge");
    await wrapper.get("button").trigger("click");

    expect(wrapper.get('[data-testid="result"]').text()).toBe("TestForge");
  });

  it("should fail when Vuetify plugin is not included in the preset", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    try {
      const preset: PresetDefinition = {
        manifest: [],
        defaults: {},
      };

      const { testComponentFactory } = createTestFramework({
        preset,
      });

      const factoryWithoutVuetify = testComponentFactory(VuetifyFixture);

      expect(() => factoryWithoutVuetify()).toThrow();
      expect(warn).toHaveBeenCalled();
    } finally {
      warn.mockRestore();
    }
  });
});
