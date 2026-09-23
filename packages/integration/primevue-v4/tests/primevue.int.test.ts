/* @vitest-environment happy-dom */
import { describe, expect, it } from "vitest";

import PrimeVueFixture from "../src/PrimeVueFixture.vue";
import { testComponentFactory } from "./setup.js";
import { createTestFramework } from "@testforgejs/vue-test-core";

import type { PresetDefinition } from "@testforgejs/vue-test-core";

describe("PrimeVue 4 integration", () => {
  const factory = testComponentFactory(PrimeVueFixture);

  it("should mount PrimeVue components", () => {
    const wrapper = factory();

    expect(wrapper.find('input[aria-label="Name"]').exists()).toBe(true);
    expect(wrapper.find("button").exists()).toBe(true);
  });

  it("should support interaction with PrimeVue components", async () => {
    const wrapper = factory();

    await wrapper.get('input[aria-label="Name"]').setValue("TestForge");
    await wrapper.get("button").trigger("click");

    expect(wrapper.get('[data-testid="result"]').text()).toBe("TestForge");
    expect(wrapper.get('[data-testid="primevue-config"]').text()).toBe("true");
  });

  it("should fail when PrimeVue plugin is not included in the preset", () => {
    const preset: PresetDefinition = {
      manifest: [],
      defaults: {},
    };

    const { testComponentFactory } = createTestFramework({
      preset,
    });
    const factory = testComponentFactory(PrimeVueFixture);
    expect(() => factory()).toThrow();
  });
});
