import { primeVuePlugin } from "@testforgejs/vue-test-plugin-primevue";
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
    primevue: primeVuePlugin.getDefaultOptions(),
  },
};

const { testComponentFactory } = createTestFramework({
  preset,
});

export { testComponentFactory };
