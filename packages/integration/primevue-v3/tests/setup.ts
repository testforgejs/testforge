import { primeVuePlugin } from "@testforgejs/vue-test-plugin-primevue-v3";
import { createTestFramework } from "@testforgejs/vue-test-core";
import type { PresetDefinition } from "@testforgejs/vue-test-core";

const preset: PresetDefinition = {
  manifest: [
    {
      module: primeVuePlugin,
      enabled: true,
    },
  ],
  defaults: {
    primevueV3: primeVuePlugin.getDefaultOptions(),
  },
};

const { testComponentFactory } = createTestFramework({
  preset,
});

export { testComponentFactory };
