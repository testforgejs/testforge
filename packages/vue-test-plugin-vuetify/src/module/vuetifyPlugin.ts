import { createVuetifyPlugin } from "./createVuetifyPlugin.js";

import type { PluginModule } from "@testforge/vue-test-core";
import type { VueTestVuetifyOptions, VuetifyInstance } from "../types/types";

export const vuetifyPlugin: PluginModule<VuetifyInstance, VueTestVuetifyOptions> = {
  getName: () => "vuetify",

  getDefinition: () => ({
    create: createVuetifyPlugin,
  }),
};
