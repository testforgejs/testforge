import { expectType, expectAssignable, expectError } from "tsd";
import {
  createTestFramework,
  captureInstance,
  withPluginInstance,
} from "@testforgejs/vue-test-core";
import { routerPlugin } from "../dist/index.js";
import { defineComponent } from "vue";
import { createMemoryHistory } from "vue-router";

import type { VueWrapper, mount } from "@vue/test-utils";
import type { Router, RouteLocationNormalizedLoaded } from "vue-router";
import type { VueTestRouterOptions } from "../dist/index.js";

/*
 * VueTestRouterOptions should represent native Vue Router options.
 *
 * Managed instance controls are provided separately by TestForge
 * through PluginOptionsInput and PluginOverridesInput.
 */
expectAssignable<VueTestRouterOptions>({
  history: createMemoryHistory(),
  routes: [],
});

/*
 * The legacy expose callback must not be accepted
 * as a VueTestRouterOptions property.
 */
expectError<VueTestRouterOptions>({
  history: createMemoryHistory(),
  routes: [],
  expose(_instance: Router) {},
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

/*
 * mountOptions.plugins should require complete native Router options
 * when no pre-created instance is supplied.
 */

// Missing history.
expectError(
  factory(
    {},
    {
      plugins: {
        router: {
          routes: [],
        },
      },
    },
  ),
);

// Missing routes.
expectError(
  factory(
    {},
    {
      plugins: {
        router: {
          history: createMemoryHistory(),
        },
      },
    },
  ),
);

// Both required options are missing.
expectError(
  factory(
    {},
    {
      plugins: {
        router: {},
      },
    },
  ),
);

/*
 * Existing Router instance used to verify type-safe instance reuse.
 */
declare const existingRouter: Router;

const sharedRouterOptions = withPluginInstance(existingRouter);

/*
 * mountOptions.plugins should accept a pre-created Router instance.
 *
 * Required native options can be omitted because the Router
 * instance already exists.
 */
factory(
  {},
  {
    plugins: {
      router: {
        ...sharedRouterOptions,
      },
    },
  },
);

/*
 * A pre-created Router instance can be combined with
 * partial native Router options.
 */
factory(
  {},
  {
    plugins: {
      router: {
        routes: [],
        ...sharedRouterOptions,
      },
    },
  },
);

/*
 * extraOptions.plugins should support combining a pre-created
 * Router instance with partial native options.
 */
factory(
  {},
  {},
  {},
  {
    plugins: {
      router: {
        routes: [],
        ...sharedRouterOptions,
      },
    },
  },
);

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

// Unknown plugin names must be rejected alongside valid plugin names.
expectError(
  factory(
    {},
    {
      plugins: {
        router: {
          history: createMemoryHistory(),
          routes: [],
        },
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

/*
 * extraOptions.plugins should accept a pre-created Router instance.
 */
factory(
  {},
  {},
  {},
  {
    plugins: {
      router: {
        ...sharedRouterOptions,
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

// Unknown plugin names must be rejected alongside valid plugin names.
expectError(
  factory(
    {},
    {},
    {},
    {
      plugins: {
        router: {
          routes: [],
        },
        rooter: {
          routes: [],
        },
      },
    },
  ),
);

// Verify defaultMountOptions

/*
 * defaultMountOptions should support native Router options.
 *
 * Instance capture is intentionally omitted because it is
 * prohibited in factory-level defaults at runtime.
 */
framework.testComponentFactory(TypedComponent, undefined, () => ({
  plugins: {
    router: {
      history: createMemoryHistory(),
      routes: [],
    },
  },
}));

expectError(
  framework.testComponentFactory(TypedComponent, undefined, () => ({
    plugins: {
      rooter: {
        history: createMemoryHistory(),
        routes: [],
      },
    },
  })),
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

/*
 * The captured instance must be read-only.
 */
expectError((typedCapture.instance = existingRouter));

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
        router: {
          history: createMemoryHistory(),
          routes: [],
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
        router: {
          ...incompatibleCapture,
        },
      },
    },
  ),
);

/*
 * withPluginInstance() should reject an incompatible instance
 * when used in the managed Router configuration.
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
        router: {
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
        router: {
          ...incompatibleSharedOptions,
        },
      },
    },
  ),
);
