/** @vitest-environment jsdom */

import { describe, it, expect, beforeEach } from "vitest";
import { createTestFramework, captureInstance } from "@testforgejs/vue-test-core";
import { i18nPlugin } from "../index";
import { h } from "vue";
import { useI18n } from "vue-i18n";

import type { WritableComputedRef } from "vue";
import type { Composer, I18n } from "vue-i18n";
import type { TestFramework } from "@testforgejs/vue-test-core";

const Component = {
  setup() {
    const { t } = useI18n();

    return () => h("div", t("hello"));
  },
};

describe("i18nPlugin integration", () => {
  let framework: TestFramework;

  beforeEach(() => {
    framework = createTestFramework({
      presets: {
        default: {
          manifest: [{ module: i18nPlugin, enabled: true }],
          defaults: {
            i18n: {
              legacy: false,
              locale: "en",
              messages: {},
            },
          },
        },
      },
    });
  });

  it("should install vue-i18n plugin", () => {
    const factory = framework.testComponentFactory(Component);
    const wrapper = factory(
      {},
      {
        plugins: {
          i18n: {
            locale: "en",
            messages: {
              en: {
                hello: "Hello World",
              },
            },
          },
        },
      },
    );

    expect(wrapper.text()).toBe("Hello World");
  });

  it("should capture i18n instance", async () => {
    const i18nCapture = captureInstance<I18n>();

    const factory = framework.testComponentFactory(
      Component,
      {},
      {
        plugins: {
          i18n: {
            locale: "en",
            messages: {
              en: {
                hello: "Hello World",
              },
              de: {
                hello: "Hallo Welt",
              },
            },
            ...i18nCapture,
          },
        },
      },
    );

    const wrapper = factory();

    const i18n = i18nCapture.instance;
    if (!i18n) {
      throw new Error("Expected i18n instance");
    }

    expect(wrapper.text()).toBe("Hello World");
    (i18n!.global.locale as WritableComputedRef<string>).value = "de";
    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toBe("Hallo Welt");
  });

  it("should expose i18n instance", () => {
    let exposedInstance: I18n | undefined;

    const factory = framework.testComponentFactory(
      Component,
      {},
      {
        plugins: {
          i18n: {
            locale: "en",
            messages: {
              en: {
                hello: "Hello World",
              },
            },
            expose: (instance) => {
              exposedInstance = instance;
            },
          },
        },
      },
    );

    factory();

    if (!exposedInstance) {
      throw new Error("Expected i18n instance");
    }

    const composer = exposedInstance.global as Composer;

    expect(composer.locale.value).toBe("en");
    expect(composer.t("hello")).toBe("Hello World");
  });
});
