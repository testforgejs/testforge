/** @vitest-environment jsdom */

import { describe, beforeEach, it, expect } from "vitest";
import { createTestFramework, captureInstance } from "@testforge/vue-test-core";
import { piniaPlugin } from "../index";
import { h } from "vue";
import { defineStore } from "pinia";

import type { TestFramework } from "@testforge/vue-test-core";
import type { Pinia } from "pinia";

// Creating a test store for integration testing
const useCounterStore = defineStore("counter", {
  state: () => ({ count: 0 }),
  actions: {
    increment() {
      this.count++;
    },
  },
});

// A test component that uses the Pinia store
const Component = {
  setup() {
    const store = useCounterStore();
    return () => h("div", String(store.count));
  },
};

describe("piniaPlugin integration", () => {
  let framework: TestFramework;

  beforeEach(() => {
    framework = createTestFramework({
      presets: {
        default: {
          manifest: [{ module: piniaPlugin, enabled: true }],
          defaults: {
            pinia: {
              // By default, @pinia/testing stubs (replaces with placeholders) all actions.
              // Turn this off to test how the action actually behaves.
              stubActions: false,
            },
          },
        },
      },
    });
  });

  it("should install pinia plugin and provide default store values when factory is initialized", () => {
    // Arrange
    const factory = framework.testComponentFactory(Component);

    // Act
    const wrapper = factory();

    // Assert
    expect(wrapper.text()).toBe("0");
  });

  it("should call mockStores callback to modify store state when option is provided", () => {
    // Arrange
    const factory = framework.testComponentFactory(
      Component,
      {},
      {
        plugins: {
          pinia: {
            mockStores: () => {
              const store = useCounterStore();
              store.count = 42; // Mutation of the state before mounting
            },
          },
        },
      },
    );

    // Act
    const wrapper = factory();

    // Assert
    expect(wrapper.text()).toBe("42");
  });

  it("should capture pinia instance and reflect updates when state is modified externally", async () => {
    // Arrange
    const piniaCapture = captureInstance<Pinia>();
    const factory = framework.testComponentFactory(
      Component,
      {},
      {
        plugins: {
          pinia: {
            ...piniaCapture,
          },
        },
      },
    );

    // Act
    const wrapper = factory();

    if (!piniaCapture.instance) {
      throw new Error("Expected pinia instance to be captured");
    }

    // Assert
    expect(wrapper.text()).toBe("0");

    // Call the store action via the context of the captured Pinia instance
    const store = useCounterStore(piniaCapture.instance);
    store.increment();

    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toBe("1");
  });

  it("should expose pinia instance through callback when expose option is provided", () => {
    // Arrange
    let exposedInstance: Pinia | undefined;

    const factory = framework.testComponentFactory(
      Component,
      {},
      {
        plugins: {
          pinia: {
            expose: (instance) => {
              exposedInstance = instance;
            },
          },
        },
      },
    );

    // Act
    factory();

    // Guard assertion for type narrowing
    if (!exposedInstance) {
      throw new Error("Expected pinia instance to be exposed");
    }

    // Assert
    const store = useCounterStore(exposedInstance);
    expect(store.count).toBe(0);
  });
});
