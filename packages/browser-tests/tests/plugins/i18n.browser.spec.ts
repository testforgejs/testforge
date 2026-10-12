import { describe, test, expect } from "vitest";
import { page } from "vitest/browser";

import { defineComponent, h } from "vue";
import { useI18n } from "vue-i18n";

import { createTestFramework } from "@testforgejs/vue-test-core";
import { i18nPlugin } from "@testforgejs/vue-test-plugin-i18n";

describe("Vue I18n Browser Integration", () => {
  test("should update translations when switching locales in a real browser", async () => {
    const TestComponent = defineComponent({
      name: "TestComponent",

      setup() {
        const { t, locale } = useI18n({
          useScope: "global",
        });

        const switchLocale = () => {
          locale.value = locale.value === "en" ? "uk" : "en";
        };

        return () =>
          h("div", [
            h("p", t("greeting")),

            h(
              "button",
              {
                type: "button",
                onClick: switchLocale,
              },
              "Switch locale",
            ),
          ]);
      },
    });

    const { testComponentFactory } = createTestFramework({
      preset: {
        manifest: [
          {
            module: i18nPlugin,
            enabled: true,
          },
        ],

        defaults: {
          i18n: () => ({
            legacy: false,
            locale: "en",
            fallbackLocale: "en",

            messages: {
              en: {
                greeting: "Hello",
              },
              uk: {
                greeting: "Привіт",
              },
            },
          }),
        },
      },
    });

    const factory = testComponentFactory(TestComponent);

    const container = document.createElement("div");
    document.body.appendChild(container);

    let wrapper: ReturnType<typeof factory> | undefined;

    try {
      // Mount the component using the real Vue I18n plugin.
      wrapper = factory(
        {},
        {
          attachTo: container,
        },
      );

      // Verify the initial translation.
      await expect.element(page.getByText("Hello", { exact: true })).toBeVisible();

      // Switch to Ukrainian through a real browser interaction.
      await page
        .getByRole("button", {
          name: "Switch locale",
        })
        .click();

      // Verify that the translation updates reactively.
      await expect.element(page.getByText("Привіт", { exact: true })).toBeVisible();

      expect(wrapper.text()).toContain("Привіт");

      // Switch back to English.
      await page
        .getByRole("button", {
          name: "Switch locale",
        })
        .click();

      await expect.element(page.getByText("Hello", { exact: true })).toBeVisible();

      expect(wrapper.text()).toContain("Hello");
    } finally {
      wrapper?.unmount();
      container.remove();
    }
  });
});
