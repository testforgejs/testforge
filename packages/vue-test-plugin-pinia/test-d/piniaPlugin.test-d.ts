import { expectType, expectAssignable, expectNotAssignable, expectError } from "tsd";
import {
  createTestFramework,
  captureInstance,
  withPluginInstance,
} from "@testforgejs/vue-test-core";
import { piniaPlugin, withMockStores } from "../dist/index.js";
import { defineComponent } from "vue";
import { defineStore } from "pinia";

import type { VueWrapper, mount } from "@vue/test-utils";
import type { TestingPinia } from "@pinia/testing";
import type { VueTestPiniaOptions } from "../dist/index.js";
import type { PluginOptionsInput } from "@testforgejs/vue-test-core";

/*
 * Type-only plugin registration without a corresponding
 * PluginInstanceMap entry.
 *
 * Used to verify the unknown instance fallback.
 */
declare module "@testforgejs/vue-test-core" {
  interface PluginOptionsMap {
    optionsOnlyPluginTypeSpec: {
      apiKey: string;
      enabled?: boolean;
    };
  }
}

/*
 * Plugins without PluginInstanceMap registration must reject
 * managed instance controls.
 */
type OptionsOnlyPluginInput = NonNullable<PluginOptionsInput["optionsOnlyPluginTypeSpec"]>;

// Native options are supported.
expectAssignable<OptionsOnlyPluginInput>({
  apiKey: "test-key",
});

// Instance capture is not supported.
expectNotAssignable<OptionsOnlyPluginInput>({
  apiKey: "test-key",
  ...captureInstance<unknown>(),
});

// Pre-created instances are not supported.
expectNotAssignable<OptionsOnlyPluginInput>({
  apiKey: "test-key",
  ...withPluginInstance({
    id: "custom-instance",
  }),
});

// Required native options remain required.
expectNotAssignable<OptionsOnlyPluginInput>({
  enabled: true,
});

// Test store for checking types within callbacks
const useCounterStore = defineStore("counter", {
  state: () => ({ count: 0 }),
});

/*
 * VueTestPiniaOptions should combine native @pinia/testing options
 * with TestForge-specific store initialization through the
 * symbol-keyed withMockStores() helper.
 *
 * Managed instance controls are added separately by the core
 * plugin configuration types.
 */
expectAssignable<VueTestPiniaOptions>({
  stubActions: true,
  initialState: { counter: { count: 10 } },
  ...withMockStores((pinia) => {
    expectType<TestingPinia>(pinia);

    const store = useCounterStore(pinia);
    store.count = 20;
  }),
});

/*
 * VueTestPiniaOptions should reject the legacy string-keyed mockStores
 * option in favor of the symbol-based withMockStores() helper.
 */
expectError<VueTestPiniaOptions>({
  mockStores: (_pinia: TestingPinia) => {},
});

/*
 * withMockStores() should reject non-function arguments and callbacks
 * with incompatible Pinia instance types.
 */
expectError(withMockStores(123));

expectError(
  withMockStores((pinia: string) => {
    console.log(pinia);
  }),
);

/*
 * captureInstance should preserve the provided Pinia instance type.
 */
const capture = captureInstance<TestingPinia>();

expectType<TestingPinia | undefined>(capture.instance);

/*
 * Pinia should support instance capture through PluginOptionsInput.
 */
expectAssignable<NonNullable<PluginOptionsInput["pinia"]>>({
  ...capture,
});

/*
 * withPluginInstance() should preserve the TestingPinia instance type
 * and allow reusing a pre-created Pinia instance.
 */
declare const existingPinia: TestingPinia;

const sharedPiniaOptions = withPluginInstance(existingPinia);

expectAssignable<NonNullable<PluginOptionsInput["pinia"]>>(sharedPiniaOptions);

/*
 * Module augmentation should register "pinia"
 * in PluginOptionsMap.
 */
const framework = createTestFramework({
  presets: {
    default: {
      manifest: [
        {
          module: piniaPlugin,
          enabled: true,
        },
      ],
      defaults: {
        pinia: () => ({
          stubActions: true,
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

/*
 * mountOptions should support native Pinia options, symbol-keyed store
 * initialization, and type-safe plugin instance capturing.
 */
const factory = framework.testComponentFactory(TypedComponent);

const wrapper = factory(
  {},
  {
    plugins: {
      pinia: {
        stubActions: false,

        ...withMockStores((pinia) => {
          expectType<TestingPinia>(pinia);
        }),

        ...capture,
      },
    },
  },
);

// Verify factory return type
expectType<ReturnType<typeof mount<typeof TypedComponent>>>(wrapper);
expectAssignable<VueWrapper<InstanceType<typeof TypedComponent>>>(wrapper);

/*
 * mountOptions.plugins should accept a pre-created TestingPinia instance.
 *
 * Native options can be omitted because the instance already exists.
 */
factory(
  {},
  {
    plugins: {
      pinia: {
        ...withPluginInstance(existingPinia),
      },
    },
  },
);

/*
 * extraOptions.plugins should also accept a pre-created TestingPinia instance.
 */
factory(
  {},
  {},
  {},
  {
    plugins: {
      pinia: {
        ...withPluginInstance(existingPinia),
      },
    },
  },
);

// Verify typo protection in plugin name (should catch "pinya" instead of "pinia")
expectError(
  factory(
    {},
    {
      plugins: {
        pinya: {
          stubActions: true,
        },
      },
    },
  ),
);

// Verify extraOptions
const extraCapture = captureInstance<TestingPinia>();

factory(
  {},
  {},
  {},
  {
    plugins: {
      pinia: {
        stubActions: true,
        ...extraCapture,
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
        pinya: {
          stubActions: true,
        },
      },
    },
  ),
);

/*
 * defaultMountOptions should support native Pinia options and
 * symbol-keyed store initialization through withMockStores().
 *
 * Instance capturing is intentionally omitted because it is
 * prohibited in factory-level defaults at runtime.
 */
framework.testComponentFactory(TypedComponent, undefined, () => ({
  plugins: {
    pinia: {
      stubActions: false,

      ...withMockStores((pinia) => {
        expectType<TestingPinia>(pinia);
      }),
    },
  },
}));

expectError(
  framework.testComponentFactory(TypedComponent, undefined, () => ({
    plugins: {
      pinya: {
        stubActions: true,
      },
    },
  })),
);

// Verify that invalid property access triggers a type error
expectError(captureInstance<TestingPinia>().instance?.unknownProperty);

// Reject instance capture with an incompatible plugin instance type.
type IncompatibleInstance = {
  readonly incompatibleInstance: unique symbol;
};

const incompatibleCapture = captureInstance<IncompatibleInstance>();

expectError(
  factory(
    {},
    {},
    {},
    {
      plugins: {
        pinia: {
          stubActions: true,
          ...incompatibleCapture,
        },
      },
    },
  ),
);

expectError(
  factory(
    {},
    {
      plugins: {
        pinia: {
          stubActions: true,
          ...incompatibleCapture,
        },
      },
    },
  ),
);

/*
 * withPluginInstance() should reject an incompatible instance
 * when used in the managed Pinia configuration.
 */
declare const incompatibleInstance: IncompatibleInstance;

const incompatibleSharedOptions = withPluginInstance(incompatibleInstance);

// Reject incompatible instances in mountOptions.plugins.
expectError(
  factory(
    {},
    {
      plugins: {
        pinia: {
          ...incompatibleSharedOptions,
        },
      },
    },
  ),
);

// Reject incompatible instances in extraOptions.plugins.
expectError(
  factory(
    {},
    {},
    {},
    {
      plugins: {
        pinia: {
          ...incompatibleSharedOptions,
        },
      },
    },
  ),
);
