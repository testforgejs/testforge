import { expectType, expectAssignable, expectError } from "tsd";
import {
  createTestFramework,
  captureInstance,
  withPluginInstance,
} from "@testforgejs/vue-test-core";
import { i18nPlugin } from "../dist/index.js";
import { defineComponent } from "vue";

import type { VueWrapper, mount } from "@vue/test-utils";
import type { I18n } from "vue-i18n";
import type { VueTestI18nOptions } from "../dist/index.js";
import type { PluginOptionsInput } from "@testforgejs/vue-test-core";

/*
 * VueTestI18nOptions should represent native Vue I18n options.
 *
 * Managed instance controls are provided separately by TestForge
 * through PluginOptionsInput and PluginOverridesInput.
 */
expectAssignable<VueTestI18nOptions>({
  locale: "en",
  messages: {},
});

/*
 * The legacy expose callback must not be accepted
 * as a VueTestI18nOptions property.
 */
expectError<VueTestI18nOptions>({
  locale: "en",
  messages: {},
  expose(_instance: I18n) {},
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
        i18n: () => ({
          locale: "en",
          messages: {},
        }),
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

/*
 * withPluginInstance() should preserve the I18n instance type
 * and allow reusing a pre-created Vue I18n instance.
 */
declare const existingI18n: I18n;

const sharedI18nOptions = withPluginInstance(existingI18n);

/*
 * PluginOptionsInput should accept a pre-created I18n instance
 * registered through PluginInstanceMap.
 */
expectAssignable<NonNullable<PluginOptionsInput["i18n"]>>(sharedI18nOptions);

/*
 * mountOptions.plugins should accept a pre-created I18n instance.
 *
 * Native options can be omitted because the instance already exists.
 */
factory(
  {},
  {
    plugins: {
      i18n: {
        ...sharedI18nOptions,
      },
    },
  },
);

/*
 * A pre-created I18n instance can be combined with native options.
 */
factory(
  {},
  {
    plugins: {
      i18n: {
        locale: "en",
        ...sharedI18nOptions,
      },
    },
  },
);

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
        ...capture,
      },
    },
  },
);

expectType<I18n | undefined>(capture.instance);

expectError(capture.expose);

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
const extraCapture = captureInstance<I18n>();

factory(
  {},
  {},
  {},
  {
    plugins: {
      i18n: {
        locale: "de",
        ...extraCapture,
      },
    },
  },
);

/*
 * extraOptions.plugins should accept a pre-created I18n instance.
 */
factory(
  {},
  {},
  {},
  {
    plugins: {
      i18n: {
        ...sharedI18nOptions,
      },
    },
  },
);

/*
 * extraOptions.plugins should support combining a pre-created
 * I18n instance with native options.
 */
factory(
  {},
  {},
  {},
  {
    plugins: {
      i18n: {
        locale: "de",
        ...sharedI18nOptions,
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

/*
 * defaultMountOptions should support native I18n options.
 *
 * Instance capturing is intentionally omitted because it is
 * prohibited in factory-level defaults at runtime.
 */
framework.testComponentFactory(TypedComponent, undefined, () => ({
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
}));

expectError(
  framework.testComponentFactory(TypedComponent, undefined, () => ({
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
  })),
);

expectError(captureInstance<I18n>().instance?.unknownProperty);

// Reject instance capture with an incompatible plugin instance type.
type IncompatibleInstance = {
  readonly incompatibleInstance: unique symbol;
};

const incompatibleCapture = captureInstance<IncompatibleInstance>();

expectError(
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
          ...incompatibleCapture,
        },
      },
    },
  ),
);

/*
 * Reject incompatible instance capture in extraOptions.plugins.
 */
expectError(
  factory(
    {},
    {},
    {},
    {
      plugins: {
        i18n: {
          ...incompatibleCapture,
        },
      },
    },
  ),
);

/*
 * withPluginInstance() should reject an incompatible instance
 * when used in the managed I18n configuration.
 */
declare const incompatibleInstance: IncompatibleInstance;

const incompatibleSharedOptions = withPluginInstance(incompatibleInstance);

/*
 * Reject incompatible pre-created instances in mountOptions.plugins.
 */
expectError(
  factory(
    {},
    {
      plugins: {
        i18n: {
          ...incompatibleSharedOptions,
        },
      },
    },
  ),
);

/*
 * Reject incompatible pre-created instances in extraOptions.plugins.
 */
expectError(
  factory(
    {},
    {},
    {},
    {
      plugins: {
        i18n: {
          ...incompatibleSharedOptions,
        },
      },
    },
  ),
);
