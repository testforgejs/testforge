/** @jest-environment jsdom */
/** @vitest-environment jsdom */

import { createTestFramework, captureInstance } from "@testforgejs/vue-test-core";
import { i18nPlugin } from "../index";
import { h } from "vue";
import { useI18n } from "vue-i18n";

const Component = {
  setup() {
    const { t } = useI18n();

    return () => h("div", t("hello"));
  },
};

describe("i18nPlugin integration", () => {
  let framework;

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
    const i18nCapture = captureInstance();

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

    expect(wrapper.text()).toBe("Hello World");
    i18nCapture.instance.global.locale.value = "de";
    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toBe("Hallo Welt");
  });

  it("should expose i18n instance", () => {
    let exposedInstance;

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

    expect(exposedInstance.global.locale.value).toBe("en");
    expect(exposedInstance.global.t("hello")).toBe("Hello World");
  });
});
