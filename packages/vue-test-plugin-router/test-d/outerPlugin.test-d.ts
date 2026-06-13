import { expectType, expectAssignable, expectError } from "tsd";
import { createTestFramework, captureInstance } from "@testforge/vue-test-core";
import { routerPlugin } from "../dist/index.js";
import { defineComponent } from "vue";
import { createMemoryHistory } from "vue-router";

import type { VueWrapper, mount } from "@vue/test-utils";
import type { Router, RouteLocationNormalizedLoaded } from "vue-router";
import type { VueTestRouterOptions } from "../dist/index.js";

/*
 * VueTestRouterOptions should include vue-router options
 * and TestForge plugin control options.
 */
expectAssignable<VueTestRouterOptions>({
  history: createMemoryHistory(),
  routes: [],
  expose(instance) {
    expectType<Router>(instance);
  },
});

/*
 * captureInstance should preserve the provided instance type.
 */
const capture = captureInstance<Router>();

expectType<Router | undefined>(capture.instance);

/*
 * Module augmentation should register "router"
 * in PluginOptionsMap.
 */
const framework = createTestFramework({
  presets: {
    default: {
      manifest: [
        {
          module: routerPlugin,
          enabled: true,
        },
      ],
      defaults: {
        router: {
          history: createMemoryHistory(),
          routes: [],
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
      router: {
        history: createMemoryHistory(),
        routes: [{ path: "/", component: TypedComponent }],
        expose: (instance) => {
          expectType<Router>(instance);
        },
      },
    },
  },
);

// Verify factory return type
expectType<ReturnType<typeof mount<typeof TypedComponent>>>(wrapper);
expectAssignable<VueWrapper<InstanceType<typeof TypedComponent>>>(wrapper);

// Verify that the $router and $route properties exist and have correct types
expectType<Router>(wrapper.vm.$router);
expectType<RouteLocationNormalizedLoaded>(wrapper.vm.$route);

// Conversion of the wrapper to a clean interface
const cleanWrapper = wrapper as unknown as VueWrapper<InstanceType<typeof TypedComponent>>;
expectType<Router>(cleanWrapper.vm.$router);

// Verify typo protection in plugin name (should catch "rooter" instead of "router")
expectError(
  factory(
    {},
    {
      plugins: {
        rooter: {
          history: createMemoryHistory(),
          routes: [],
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
      router: {
        routes: [],
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
        rooter: {
          routes: [],
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
      router: {
        history: createMemoryHistory(),
        routes: [],
        expose: (instance) => {
          expectType<Router>(instance);
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
        rooter: {
          history: createMemoryHistory(),
          routes: [],
        },
      },
    },
  ),
);

// Verify that invalid property access triggers a type error
expectError(captureInstance<Router>().instance?.unknownProperty);
