/** @vitest-environment jsdom */

import { describe, beforeEach, it, expect } from "vitest";
import { createTestFramework, captureInstance } from "@testforge/vue-test-core";
import { vuetifyPlugin } from "../index";
import { h } from "vue";

import type { TestFramework } from "@testforge/vue-test-core";
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
            vuetify: {},
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

    const factory = framework.testComponentFactory(
      Component,
      {},
      {
        plugins: {
          vuetify: {
            ...vuetifyCapture,
          },
        },
      },
    );

    factory();
    expect(vuetifyCapture.instance).toBeDefined();
    if (!vuetifyCapture.instance) {
      throw Error("instance should be defined");
    }
    expect(typeof vuetifyCapture.instance.install).toBe("function");
  });

  it("should expose vuetify instance through callback when expose option is provided", () => {
    let exposedInstance: VuetifyInstance | undefined;

    const factory = framework.testComponentFactory(
      Component,
      {},
      {
        plugins: {
          vuetify: {
            expose(instance) {
              exposedInstance = instance;
            },
          },
        },
      },
    );

    factory();

    expect(exposedInstance).toBeDefined();

    if (!exposedInstance) {
      throw Error("exposedInstance should be defined");
    }
    expect(exposedInstance.install).toBeTypeOf("function");
  });
});
