import { expectType, expectAssignable, expectError } from "tsd";
import { createTestFramework, captureInstance } from "@testforgejs/vue-test-core";
import { i18nPlugin } from "../dist/index.js";
import { defineComponent } from "vue";

import type { VueWrapper, mount } from "@vue/test-utils";
import type { I18n } from "vue-i18n";
import type { VueTestI18nOptions } from "../dist/index.js";

/*
 * VueTestI18nOptions should include vue-i18n options
 * and TestForge plugin control options.
 */
expectAssignable<VueTestI18nOptions>({
  locale: "en",
  messages: {},
  expose(instance) {
    expectType<I18n>(instance);
  },
});

/*
 * captureInstance should preserve the provided instance type.
 */
const capture = captureInstance<I18n>();

expectType<I18n | undefined>(capture.instance);

/*
 * Module augmentation should register "i18n"
 * in PluginOptionsMap.
 */
const framework = createTestFramework({
  presets: {
    default: {
      manifest: [
        {
          module: i18nPlugin,
          enabled: true,
        },
      ],
      defaults: {
        i18n: {
          locale: "en",
          messages: {},
        },
      },
    },
  },
});

expectType<ReturnType<typeof createTestFramework>>(framework);

const TypedComponent = defineComponent({
  name: "TypedComponent",
  props: {
    title: {
      type: String,
      required: true,
    },
  },
  render() {
    return null;
  },
});

// Verify mountOptions
const factory = framework.testComponentFactory(TypedComponent);

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
        expose: (instance) => {
          expectType<I18n>(instance);
        },
      },
    },
  },
);

// Verify captured instance type
const i18nCapture = captureInstance();

factory(
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
        ...i18nCapture,
      },
    },
  },
);

expectType<I18n | undefined>(capture.instance);

// Verify factory return type
expectType<ReturnType<typeof mount<typeof TypedComponent>>>(wrapper);
expectAssignable<VueWrapper<InstanceType<typeof TypedComponent>>>(wrapper);

// Verify that the $t$ method exists and has the correct signature
// The i18n plugin adds the function $t(key: string): string;
expectAssignable<(key: string) => string>(wrapper.vm.$t);
expectType<string>(wrapper.vm.$t("message.hello"));
expectType<string>(wrapper.vm.$d(new Date(), "short"));
expectType<string>(wrapper.vm.$n(1000, "currency"));

// Verify the global $i18n object and its properties
expectType<string>(wrapper.vm.$i18n.locale);
expectType<string[]>(wrapper.vm.$i18n.availableLocales);

// Conversion of the wrapper to a clean interface
const cleanWrapper = wrapper as unknown as VueWrapper<InstanceType<typeof TypedComponent>>;
expectAssignable<(key: string) => string>(cleanWrapper.vm.$t);

expectError(
  factory(
    {},
    {
      plugins: {
        i19n: {
          locale: "en",
          messages: {
            en: {
              hello: "Hello World",
            },
          },
        },
      },
    },
  ),
);

// Verify extraOptions
factory(
  {},
  {},
  {},
  {
    plugins: {
      i18n: {
        locale: "de",
      },
    },
  },
);

expectError(
  factory(
    {},
    {},
    {},
    {
      plugins: {
        i19n: {
          locale: "de",
        },
      },
    },
  ),
);

// Verify defaultMountOptions
framework.testComponentFactory(
  TypedComponent,
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
          expectType<I18n>(instance);
          //exposedInstance = instance;
        },
      },
    },
  },
);

expectError(
  framework.testComponentFactory(
    TypedComponent,
    {},
    {
      plugins: {
        i19n: {
          locale: "en",
          messages: {
            en: {
              hello: "Hello World",
            },
          },
        },
      },
    },
  ),
);

expectError(captureInstance<I18n>().instance?.unknownProperty);
