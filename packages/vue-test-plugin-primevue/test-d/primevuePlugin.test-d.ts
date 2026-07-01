import { expectAssignable, expectError } from "tsd";
import { createTestFramework } from "@testforge/vue-test-core";
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
        primevue: {
          ripple: true,
        },
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

expectError(
  framework.testComponentFactory(
    {},
    {},
    {
      plugins: {
        primevue: {
          expose(_instance: any) {},
        },
      },
    },
  ),
);
