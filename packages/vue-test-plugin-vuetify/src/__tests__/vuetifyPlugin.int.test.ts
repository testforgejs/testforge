/** @vitest-environment jsdom */

import { describe, beforeEach, it, expect } from "vitest";
import { createTestFramework, captureInstance } from "@testforgejs/vue-test-core";
import { vuetifyPlugin } from "../index";
import { h } from "vue";

import type { TestFramework } from "@testforgejs/vue-test-core";
import type { VuetifyInstance } from "../index.js";

const Component = {
  setup() {
    return () => h("div", "Hello");
  },
};

describe("vuetifyPlugin integration", () => {
  let framework: TestFramework;

  beforeEach(() => {
    framework = createTestFramework({
      presets: {
        default: {
          manifest: [{ module: vuetifyPlugin, enabled: true }],
          defaults: {
            vuetify: () => ({}),
          },
        },
      },
    });
  });

  it("should install Vuetify plugin when factory is initialized", () => {
    const factory = framework.testComponentFactory(Component);
    const wrapper = factory();

    expect(wrapper.html()).toContain("Hello");
  });

  it("should capture vuetify instance when captureInstance helper is used", async () => {
    const vuetifyCapture = captureInstance<VuetifyInstance>();

    const factory = framework.testComponentFactory(Component);

    const wrapper = factory(
      {},
      {
        plugins: {
          vuetify: {
            ...vuetifyCapture,
          },
        },
      },
    );

    expect(vuetifyCapture.instance).toBeDefined();
    expect(vuetifyCapture.instance?.install).toBeTypeOf("function");

    expect(wrapper.html()).toContain("Hello");
  });
});
