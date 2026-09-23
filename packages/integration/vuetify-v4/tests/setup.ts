import { createTestFramework } from "@testforgejs/vue-test-core";
import { vuetifyPlugin } from "@testforgejs/vue-test-plugin-vuetify";

import type { PresetDefinition } from "@testforgejs/vue-test-core";

const preset: PresetDefinition = {
  manifest: [
    {
      module: vuetifyPlugin,
      enabled: true,
    },
  ],
  defaults: {
    vuetify: vuetifyPlugin.getDefaultOptions(),
  },
};

const { testComponentFactory } = createTestFramework({
  preset,
});

export { testComponentFactory };
