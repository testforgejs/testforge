import { describe, test, expect } from "vitest";
import { page } from "vitest/browser";

import { defineComponent, h, ref } from "vue";

import { createTestFramework } from "@testforgejs/vue-test-core";

describe("TestForge Core Browser Smoke", () => {
  test("should mount and update a Vue component through TestForge in a real browser", async () => {
    const TestComponent = defineComponent({
      name: "TestComponent",

      setup() {
        const count = ref(0);

        return () =>
          h(
            "button",
            {
              type: "button",
              onClick: () => count.value++,
            },
            `Count: ${count.value}`,
          );
      },
    });

    // Create a minimal TestForge environment without managed plugins.
    const { testComponentFactory } = createTestFramework({
      preset: {
        manifest: [],
        defaults: {},
      },
    });

    const factory = testComponentFactory(TestComponent);

    const container = document.createElement("div");
    document.body.appendChild(container);

    let wrapper: ReturnType<typeof factory> | undefined;

    try {
      // Mount the component through the TestForge pipeline.
      wrapper = factory(
        {},
        {
          attachTo: container,
        },
      );

      // Verify that TestForge returns a working Vue Test Utils wrapper.
      expect(wrapper.exists()).toBe(true);
      expect(wrapper.text()).toBe("Count: 0");

      // Verify that the component is rendered in the real browser DOM.
      await expect.element(page.getByRole("button", { name: "Count: 0" })).toBeVisible();

      // Interact with the component using the browser provider.
      await page.getByRole("button", { name: "Count: 0" }).click();

      // Verify the reactive update.
      await expect.element(page.getByRole("button", { name: "Count: 1" })).toBeVisible();

      expect(wrapper.text()).toBe("Count: 1");
    } finally {
      wrapper?.unmount();
      container.remove();
    }
  });
});
