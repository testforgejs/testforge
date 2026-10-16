import { expectType, expectAssignable, expectError } from "tsd";
import { createTestFramework, captureInstance } from "@testforgejs/vue-test-core";
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
});

/*
 * The legacy expose callback must not be accepted
 * as a VueTestRouterOptions property.
 */
expectError(
  expectAssignable<VueTestRouterOptions>({
    expose(_instance: Router) {},
  }),
);

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
        router: () => ({
          history: createMemoryHistory(),
          routes: [],
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

const wrapper = factory(
  {},
  {
    plugins: {
      router: {
        history: createMemoryHistory(),
        routes: [{ path: "/", component: TypedComponent }],
        ...capture,
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
const extraCapture = captureInstance<Router>();

factory(
  {},
  {},
  {},
  {
    plugins: {
      router: {
        routes: [],
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
        rooter: {
          routes: [],
        },
      },
    },
  ),
);

// Verify defaultMountOptions
const defaultCapture = captureInstance<Router>();

framework.testComponentFactory(
  TypedComponent,
  {},
  {
    plugins: {
      router: {
        history: createMemoryHistory(),
        routes: [],
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

/*
 * captureInstance without an explicit generic defaults to unknown.
 * Spreading the capture into router options must not change its type.
 */
const untypedCapture = captureInstance();

expectType<unknown>(untypedCapture.instance);

factory(
  {},
  {
    plugins: {
      router: {
        history: createMemoryHistory(),
        routes: [],
        ...untypedCapture,
      },
    },
  },
);

expectType<unknown>(untypedCapture.instance);

// Router-specific methods are unavailable on an unknown instance.
expectError(untypedCapture.instance?.push("/about"));

/*
 * An explicit generic preserves the Router instance type.
 */
const typedCapture = captureInstance<Router>();

expectType<Router | undefined>(typedCapture.instance);
