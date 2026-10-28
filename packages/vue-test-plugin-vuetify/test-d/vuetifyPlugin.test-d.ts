import { expectType, expectAssignable, expectError } from "tsd";
import {
  createTestFramework,
  captureInstance,
  withPluginInstance,
} from "@testforgejs/vue-test-core";
import { vuetifyPlugin } from "../dist/index.js";
import { defineComponent } from "vue";

import type { VueWrapper, mount } from "@vue/test-utils";
import type { VueTestVuetifyOptions, VuetifyInstance } from "../dist/index.js";
import type { PluginOptionsInput } from "@testforgejs/vue-test-core";

/*
 * VueTestVuetifyOptions should represent native Vuetify options.
 *
 * Managed instance controls are provided separately by TestForge
 * through PluginOptionsInput and PluginOverridesInput.
 */
expectAssignable<VueTestVuetifyOptions>({
  locale: {
    locale: "en",
  },
});

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

/*
 * withPluginInstance() should preserve the Vuetify instance type
 * and allow reusing a pre-created Vuetify instance.
 */
declare const existingVuetify: VuetifyInstance;

const sharedVuetifyOptions = withPluginInstance(existingVuetify);

/*
 * PluginOptionsInput should accept a pre-created Vuetify instance
 * registered through PluginInstanceMap.
 */
expectAssignable<NonNullable<PluginOptionsInput["vuetify"]>>(sharedVuetifyOptions);

/*
 * mountOptions.plugins should accept a pre-created Vuetify instance.
 */
factory(
  {},
  {
    plugins: {
      vuetify: {
        ...sharedVuetifyOptions,
      },
    },
  },
);

/*
 * A pre-created Vuetify instance can be combined with native options.
 */
factory(
  {},
  {
    plugins: {
      vuetify: {
        locale: {
          locale: "en",
        },
        ...sharedVuetifyOptions,
      },
    },
  },
);

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

/*
 * extraOptions.plugins should accept a pre-created Vuetify instance.
 */
factory(
  {},
  {},
  {},
  {
    plugins: {
      vuetify: {
        ...sharedVuetifyOptions,
      },
    },
  },
);

/*
 * extraOptions.plugins should support combining a pre-created
 * Vuetify instance with native options.
 */
factory(
  {},
  {},
  {},
  {
    plugins: {
      vuetify: {
        locale: {
          locale: "en",
        },
        ...sharedVuetifyOptions,
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

/*
 * defaultMountOptions should support native Vuetify options.
 *
 * Instance capturing is intentionally omitted because it is
 * prohibited in factory-level defaults at runtime.
 */
framework.testComponentFactory(
  TypedComponent,
  {},
  {
    plugins: {
      vuetify: {
        locale: {
          locale: "en",
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
        vuetify: {
          ...incompatibleCapture,
        },
      },
    },
  ),
);

/*
 * withPluginInstance() should reject an incompatible instance
 * when used in the managed Vuetify configuration.
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
        vuetify: {
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
        vuetify: {
          ...incompatibleSharedOptions,
        },
      },
    },
  ),
);
