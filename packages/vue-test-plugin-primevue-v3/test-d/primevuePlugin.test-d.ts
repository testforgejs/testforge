import { expectAssignable, expectError } from "tsd";
import {
  createTestFramework,
  captureInstance,
  withPluginInstance,
} from "@testforgejs/vue-test-core";
import { primeVuePlugin } from "../dist/index.js";

import type { VueTestPrimeVueOptions } from "../dist/index.js";

expectAssignable<VueTestPrimeVueOptions>({
  ripple: true,
});

const framework = createTestFramework({
  presets: {
    default: {
      manifest: [
        {
          module: primeVuePlugin,
          enabled: true,
        },
      ],
      defaults: {
        primevueV3: () => ({
          ripple: true,
        }),
      },
    },
  },
});

framework.testComponentFactory({}, undefined, () => ({
  plugins: {
    primevueV3: {
      ripple: true,
    },
  },
}));

expectError(
  framework.testComponentFactory({}, undefined, () => ({
    plugins: {
      primevuuV3: {
        ripple: true,
      },
    },
  })),
);

/*
 * PrimeVue does not support managed instance capture.
 *
 * captureInstance() must be rejected in mountOptions.plugins,
 * even though it is supported by other managed plugins.
 */
const primeVueCapture = captureInstance<unknown>();

const factory = framework.testComponentFactory({});

/*
 * mountOptions.plugins should accept native PrimeVue options.
 */
factory(
  {},
  {
    plugins: {
      primevueV3: {
        ripple: true,
      },
    },
  },
);

/*
 * Unknown plugin names must be rejected in mountOptions.plugins,
 * even when a valid plugin is configured.
 */
expectError(
  factory(
    {},
    {
      plugins: {
        primevueV3: { ripple: true },
        primevuuV3: { ripple: true },
      },
    },
  ),
);

/*
 * Native PrimeVue options must preserve their declared value types.
 */
expectError(
  factory(
    {},
    {
      plugins: {
        primevueV3: { ripple: "true" },
      },
    },
  ),
);

/*
 * extraOptions.plugins should accept native PrimeVue options.
 */
factory(
  {},
  {},
  {},
  {
    plugins: {
      primevueV3: {
        ripple: false,
      },
    },
  },
);

/*
 * Unknown plugin names must be rejected in extraOptions.plugins,
 * even when a valid plugin is configured.
 */
expectError(
  factory(
    {},
    {},
    {},
    {
      plugins: {
        primevueV3: { ripple: false },
        primevuuV3: { ripple: true },
      },
    },
  ),
);

expectError(
  factory(
    {},
    {
      plugins: {
        primevueV3: {
          ripple: true,
          ...primeVueCapture,
        },
      },
    },
  ),
);

/*
 * PrimeVue instance capture must also be rejected
 * in extraOptions.plugins.
 */
expectError(
  factory(
    {},
    {},
    {},
    {
      plugins: {
        primevueV3: {
          ripple: true,
          ...primeVueCapture,
        },
      },
    },
  ),
);

/*
 * PrimeVue does not support reusing pre-created instances
 * through withPluginInstance().
 */
const sharedPrimeVueOptions = withPluginInstance({
  install() {},
});

expectError(
  factory(
    {},
    {
      plugins: {
        primevueV3: {
          ripple: true,
          ...sharedPrimeVueOptions,
        },
      },
    },
  ),
);

expectError(
  factory(
    {},
    {},
    {},
    {
      plugins: {
        primevueV3: {
          ripple: true,
          ...sharedPrimeVueOptions,
        },
      },
    },
  ),
);
