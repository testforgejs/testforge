import { expectAssignable, expectError } from "tsd";
import { createTestFramework } from "@testforgejs/vue-test-core";
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

framework.testComponentFactory(
  {},
  {},
  {
    plugins: {
      primevueV3: {
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
        primevuuV3: {
          ripple: true,
        },
      },
    },
  ),
);

expectError(
  framework.testComponentFactory(
    {},
    {},
    {
      plugins: {
        primevueV3: {
          expose(_instance: any) {},
        },
      },
    },
  ),
);
