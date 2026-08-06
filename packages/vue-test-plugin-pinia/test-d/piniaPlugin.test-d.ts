import { expectType, expectAssignable, expectError } from "tsd";
import { createTestFramework, captureInstance } from "@testforgejs/vue-test-core";
import { piniaPlugin } from "../dist/index.js";
import { defineComponent } from "vue";
import { defineStore } from "pinia";

import type { VueWrapper, mount } from "@vue/test-utils";
import type { Pinia } from "pinia";
import type { VueTestPiniaOptions } from "../dist/index.js";

// Test store for checking types within callbacks
const useCounterStore = defineStore("counter", {
  state: () => ({ count: 0 }),
});

/*
 * VueTestPiniaOptions should include @pinia/testing options,
 * TestForge plugin control options, and the custom mockStores function.
 */
expectAssignable<VueTestPiniaOptions>({
  stubActions: true,
  initialState: { counter: { count: 10 } },
  mockStores(pinia) {
    expectType<Pinia>(pinia);
    const store = useCounterStore(pinia);
    store.count = 20;
  },
  expose(instance) {
    expectType<Pinia>(instance);
  },
});

/*
 * captureInstance should preserve the provided Pinia instance type.
 */
const capture = captureInstance<Pinia>();

expectType<Pinia | undefined>(capture.instance);

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
        pinia: {
          stubActions: true,
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
      pinia: {
        stubActions: false,
        mockStores: (pinia) => {
          expectType<Pinia>(pinia);
        },
        expose: (instance) => {
          expectType<Pinia>(instance);
        },
      },
    },
  },
);

// Verify factory return type
expectType<ReturnType<typeof mount<typeof TypedComponent>>>(wrapper);
expectAssignable<VueWrapper<InstanceType<typeof TypedComponent>>>(wrapper);

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
factory(
  {},
  {},
  {},
  {
    plugins: {
      pinia: {
        stubActions: true,
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

// Verify defaultMountOptions
framework.testComponentFactory(
  TypedComponent,
  {},
  {
    plugins: {
      pinia: {
        mockStores: (pinia) => {
          expectType<Pinia>(pinia);
        },
        expose: (instance) => {
          expectType<Pinia>(instance);
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
        pinya: {
          stubActions: true,
        },
      },
    },
  ),
);

// Verify that invalid property access triggers a type error
expectError(captureInstance<Pinia>().instance?.unknownProperty);
