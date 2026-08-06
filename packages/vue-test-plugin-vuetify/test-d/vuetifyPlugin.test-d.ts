import { expectType, expectAssignable, expectError } from "tsd";
import { createTestFramework } from "@testforgejs/vue-test-core";
import { vuetifyPlugin } from "../dist/index.js";
import { defineComponent } from "vue";

import type { VueWrapper, mount } from "@vue/test-utils";
import type { VueTestVuetifyOptions, VuetifyInstance } from "../dist/index.js";

/*
 * VueTestVuetifyOptions should include Vuetify options
 * and TestForge plugin control options.
 */
expectAssignable<VueTestVuetifyOptions>({
  expose(instance) {
    expectType<VuetifyInstance>(instance);
  },
});

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
        vuetify: {},
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
        expose(instance) {
          expectType<VuetifyInstance>(instance);
        },
      },
    },
  },
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
factory(
  {},
  {},
  {},
  {
    plugins: {
      vuetify: {},
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
framework.testComponentFactory(
  TypedComponent,
  {},
  {
    plugins: {
      vuetify: {
        expose(instance) {
          expectType<VuetifyInstance>(instance);
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
        vuetiffy: {},
      },
    },
  ),
);
