/** @vitest-environment jsdom */

import { describe, beforeEach, it, expect } from "vitest";
import { createTestFramework, captureInstance } from "@testforge/vue-test-core";
import { routerPlugin } from "../index";
import { h } from "vue";
import { createMemoryHistory, RouterView, useRoute } from "vue-router";

import type { ComponentPublicInstance } from "vue";
import type { Router } from "vue-router";
import type { TestFramework } from "@testforge/vue-test-core";

// A test component that displays the current path for router verification
const Component = {
  setup() {
    const route = useRoute();
    return () => h("div", route.path);
  },
};

// Root component for rendering RouterView
const App = {
  setup() {
    return () => h(RouterView);
  },
};

describe("routerPlugin integration", () => {
  let framework: TestFramework;

  beforeEach(() => {
    framework = createTestFramework({
      presets: {
        default: {
          manifest: [{ module: routerPlugin, enabled: true }],
          defaults: {
            router: {
              // Using memory history for the jsdom testing environment
              history: createMemoryHistory(),
              routes: [
                { path: "/", component: Component },
                { path: "/about", component: Component },
              ],
            },
          },
        },
      },
    });
  });

  it("should install vue-router plugin when factory is initialized", async () => {
    // Arrange
    const factory = framework.testComponentFactory(App);

    // Act
    const wrapper = factory();

    const vm = wrapper.vm as ComponentPublicInstance & { $router: Router };
    const router = vm.$router;

    // Waiting for the router to initialize and make its first connection
    await router.isReady();

    // Assert
    expect(wrapper.text()).toBe("/");
  });

  it("should capture router instance and allow navigation when captureInstance helper is used", async () => {
    // Arrange
    const routerCapture = captureInstance<Router>();
    const factory = framework.testComponentFactory(
      App,
      {},
      {
        plugins: {
          router: {
            history: createMemoryHistory(),
            routes: [
              { path: "/", component: Component },
              { path: "/about", component: Component },
            ],
            ...routerCapture,
          },
        },
      },
    );

    // Act
    const wrapper = factory();

    if (!routerCapture.instance) {
      throw new Error("Expected router instance to be captured");
    }

    await routerCapture.instance.isReady();

    // Assert
    expect(wrapper.text()).toBe("/");

    // Switch to another route via the captured instance
    await routerCapture.instance.push("/about");
    expect(wrapper.text()).toBe("/about");
  });

  it("should expose router instance through callback when expose option is provided", async () => {
    // Arrange
    let exposedInstance: Router | undefined;

    const factory = framework.testComponentFactory(
      App,
      {},
      {
        plugins: {
          router: {
            history: createMemoryHistory(),
            routes: [{ path: "/", component: Component }],
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
      throw new Error("Expected router instance to be exposed");
    }

    // Assert
    expect(exposedInstance.currentRoute.value.path).toBe("/");
  });
});
