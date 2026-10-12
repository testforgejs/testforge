import { describe, test, expect } from "vitest";
import { page } from "vitest/browser";

import { mount } from "@vue/test-utils";
import { defineComponent, h, ref } from "vue";

describe("Vue Test Utils Browser Smoke", () => {
  test("should mount and update a Vue component in a real browser", async () => {
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

    const container = document.createElement("div");
    document.body.appendChild(container);

    const wrapper = mount(TestComponent, {
      attachTo: container,
    });

    try {
      // Verify that Vue Test Utils mounted the component.
      expect(wrapper.exists()).toBe(true);
      expect(wrapper.text()).toBe("Count: 0");

      // Verify that the component exists in the real browser DOM.
      const button = page.getByRole("button", {
        name: "Count: 0",
      });

      await expect.element(button).toBeVisible();

      // Simulate a browser interaction through the Playwright provider.
      await button.click();

      // Verify that Vue updated the DOM reactively.
      await expect
        .element(
          page.getByRole("button", {
            name: "Count: 1",
          }),
        )
        .toBeVisible();

      expect(wrapper.text()).toBe("Count: 1");
    } finally {
      wrapper.unmount();
      container.remove();
    }
  });
});
