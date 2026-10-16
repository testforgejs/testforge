// packages/vue-test-plugin-vuetify/test-d/vuetifyPlugin.test-d.ts

import { expectType, expectAssignable, expectError } from "tsd";
import { createTestFramework, captureInstance } from "@testforgejs/vue-test-core";
import { vuetifyPlugin } from "../dist/index.js";
import { defineComponent } from "vue";

import type { VueWrapper, mount } from "@vue/test-utils";
import type { VueTestVuetifyOptions, VuetifyInstance } from "../dist/index.js";

/*
 * VueTestVuetifyOptions should include Vuetify options
 * and TestForge plugin control options.
 */
expectAssignable<VueTestVuetifyOptions>({
  locale: {
    locale: "en",
  },
});

/*
 * The legacy expose callback must not be accepted
 * as a VueTestVuetifyOptions property.
 */
expectError(
  expectAssignable<VueTestVuetifyOptions>({
    expose(_instance: VuetifyInstance) {},
  }),
);

/*
 * captureInstance should preserve the provided instance type.
 */
const capture = captureInstance<VuetifyInstance>();

expectType<VuetifyInstance | undefined>(capture.instance);

/*
 * Module augmentation should register "vuetify"
 * in PluginOptionsMap.
 */
const framework = createTestFramework({
  presets: {
    default: {
      manifest: [
        {
          module: vuetifyPlugin,
          enabled: true,
        },
      ],
      defaults: {
        vuetify: () => ({}),
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
      vuetify: {
        ...capture,
      },
    },
  },
);

expectError(
  factory(
    {},
    {
      plugins: {
        vuetify: {
          expose(_instance: VuetifyInstance) {},
        },
      },
    },
  ),
);

// Verify factory return type
expectType<ReturnType<typeof mount<typeof TypedComponent>>>(wrapper);
expectAssignable<VueWrapper<InstanceType<typeof TypedComponent>>>(wrapper);

// Verify typo protection
expectError(
  factory(
    {},
    {
      plugins: {
        vuetiffy: {},
      },
    },
  ),
);

// Verify extraOptions
const extraCapture = captureInstance<VuetifyInstance>();

factory(
  {},
  {},
  {},
  {
    plugins: {
      vuetify: {
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
        vuetiffy: {},
      },
    },
  ),
);

// Verify defaultMountOptions
const defaultCapture = captureInstance<VuetifyInstance>();

framework.testComponentFactory(
  TypedComponent,
  {},
  {
    plugins: {
      vuetify: {
        ...defaultCapture,
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
        vuetiffy: {},
      },
    },
  ),
);

// Verify that invalid property access triggers a type error
expectError(captureInstance<VuetifyInstance>().instance?.unknownProperty);

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
        vuetify: {
          ...incompatibleCapture,
        },
      },
    },
  ),
);
