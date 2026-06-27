import { createVuetify } from "vuetify";

import type { PluginControlOptions } from "@testforge/vue-test-core";
import type { VuetifyOptions } from "vuetify";

export type VuetifyInstance = ReturnType<typeof createVuetify>;

export interface VueTestVuetifyOptions
  extends VuetifyOptions, PluginControlOptions<VuetifyInstance> {}
