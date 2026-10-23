/** @vitest-environment jsdom */

import { describe, beforeEach, it, expect, vi } from "vitest";
import {
  createTestFramework,
  captureInstance,
  withPluginInstance,
} from "@testforgejs/vue-test-core";
import { piniaPlugin, withMockStores } from "../index";
import { createTestingPinia } from "@pinia/testing";
import { defineStore } from "pinia";
import { h } from "vue";

import type { TestFramework } from "@testforgejs/vue-test-core";
import type { TestingPinia } from "@pinia/testing";

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
            pinia: () => ({
              // Execute real store actions instead of stubbing them.
              stubActions: false,
            }),
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

  it("should call withMockStores callback to modify store state before mounting", () => {
    // Arrange
    const piniaCapture = captureInstance<TestingPinia>();
    const mockStores = vi.fn((pinia: TestingPinia) => {
      const store = useCounterStore(pinia);
      store.count = 42;
    });

    const factory = framework.testComponentFactory(Component);

    // Act
    const wrapper = factory(
      {},
      {
        plugins: {
          pinia: {
            ...piniaCapture,
            ...withMockStores(mockStores),
          },
        },
      },
    );

    // Assert
    expect(mockStores).toHaveBeenCalledTimes(1);
    expect(mockStores).toHaveBeenCalledWith(piniaCapture.instance);

    expect(piniaCapture.instance).toBeDefined();
    expect(wrapper.text()).toBe("42");
  });

  it("should capture pinia instance and reflect updates when state is modified externally", async () => {
    // Arrange
    const piniaCapture = captureInstance<TestingPinia>();

    const factory = framework.testComponentFactory(Component);

    // Act
    const wrapper = factory(
      {},
      {
        plugins: {
          pinia: {
            ...piniaCapture,
          },
        },
      },
    );

    if (!piniaCapture.instance) {
      throw new Error("Expected pinia instance to be captured");
    }

    // Assert initial state
    const store = useCounterStore(piniaCapture.instance);

    expect(store.count).toBe(0);
    expect(wrapper.text()).toBe("0");

    // Call the store action via the captured Pinia instance
    store.increment();

    await wrapper.vm.$nextTick();

    // Assert updated state
    expect(store.count).toBe(1);
    expect(wrapper.text()).toBe("1");
  });

  it("should call withMockStores for an existing Pinia instance provided through overlay metadata", () => {
    // Arrange
    const providedPinia = createTestingPinia({
      createSpy: vi.fn,
      stubActions: false,
    });

    const mockStores = vi.fn((pinia: TestingPinia) => {
      const store = useCounterStore(pinia);
      store.count = 42;
    });

    const piniaCapture = captureInstance<TestingPinia>();

    const factory = framework.testComponentFactory(Component);

    // Act
    const wrapper = factory(
      {},
      {
        plugins: {
          pinia: {
            ...piniaCapture,
            ...withMockStores(mockStores),
          },
        },
      },
      {},
      {
        plugins: {
          pinia: {
            ...withPluginInstance(providedPinia),
          },
        },
      },
    );

    // Assert
    expect(mockStores).toHaveBeenCalledTimes(1);
    expect(mockStores).toHaveBeenCalledWith(providedPinia);

    expect(piniaCapture.instance).toBe(providedPinia);

    expect(useCounterStore(providedPinia).count).toBe(42);
    expect(wrapper.text()).toBe("42");
  });

  it("should apply withMockStores on every mount while preserving shared Pinia state", async () => {
    // Arrange
    const providedPinia = createTestingPinia({
      createSpy: vi.fn,
      stubActions: false,
    });

    const mockStores = vi.fn((pinia: TestingPinia) => {
      const store = useCounterStore(pinia);
      store.count++;
    });

    const factory = framework.testComponentFactory(Component);

    const extraOptions = {
      plugins: {
        pinia: {
          ...withPluginInstance(providedPinia),
          ...withMockStores(mockStores),
        },
      },
    };

    // Act
    const firstWrapper = factory({}, {}, {}, extraOptions);

    expect(firstWrapper.text()).toBe("1");

    const secondWrapper = factory({}, {}, {}, extraOptions);

    await firstWrapper.vm.$nextTick();

    // Assert
    expect(mockStores).toHaveBeenCalledTimes(2);

    expect(mockStores).toHaveBeenNthCalledWith(1, providedPinia);
    expect(mockStores).toHaveBeenNthCalledWith(2, providedPinia);

    expect(useCounterStore(providedPinia).count).toBe(2);

    expect(firstWrapper.text()).toBe("2");
    expect(secondWrapper.text()).toBe("2");
  });
});
