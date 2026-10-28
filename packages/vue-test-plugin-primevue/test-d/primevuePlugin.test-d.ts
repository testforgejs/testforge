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
        primevue: () => ({
          ripple: true,
        }),
      },
    },
  },
});

framework.testComponentFactory(
  {},
  {},
  {
    plugins: {
      primevue: {
        ripple: true,
      },
    },
  },
);

expectError(
  framework.testComponentFactory(
    {},
    {},
    {
      plugins: {
        primevuu: {
          ripple: true,
        },
      },
    },
  ),
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
      primevue: {
        ripple: true,
      },
    },
  },
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
      primevue: {
        ripple: false,
      },
    },
  },
);

expectError(
  factory(
    {},
    {
      plugins: {
        primevue: {
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
        primevue: {
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
        primevue: {
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
        primevue: {
          ripple: true,
          ...sharedPrimeVueOptions,
        },
      },
    },
  ),
);
