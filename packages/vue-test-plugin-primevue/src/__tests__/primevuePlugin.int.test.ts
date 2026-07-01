/** @vitest-environment jsdom */

import { describe, it, expect } from "vitest";
import { createTestFramework } from "@testforge/vue-test-core";
import { primeVuePlugin } from "../index";
import { h } from "vue";
import { usePrimeVue } from "primevue/config";

import type { TestFramework } from "@testforge/vue-test-core";

function createPrimeVueFramework(enabled: boolean) {
  return createTestFramework({
    presets: {
      default: {
        manifest: [
          {
            module: primeVuePlugin,
            enabled,
          },
        ],
        defaults: {
          primevue: {},
        },
      },
    },
  });
}

describe("primeVuePlugin integration", () => {
  it("should provide PrimeVue context when plugin is enabled", () => {
    const framework: TestFramework = createPrimeVueFramework(true);
    const Component = {
      setup() {
        const primevue = usePrimeVue();

        return () => h("div", String(!!primevue));
      },
    };

    const factory = framework.testComponentFactory(Component);

    const wrapper = factory();

    expect(wrapper.text()).toBe("true");
  });

  it("should throw when PrimeVue plugin is disabled", () => {
    const framework: TestFramework = createPrimeVueFramework(false);

    const Component = {
      setup() {
        usePrimeVue();

        return () => h("div");
      },
    };

    const factory = framework.testComponentFactory(Component);

    expect(() => factory()).toThrow(/PrimeVue is not installed/i);
  });
});
