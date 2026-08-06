import { createVuetify } from "vuetify";

import type { PluginControlOptions } from "@testforgejs/vue-test-core";
import type { VuetifyOptions } from "vuetify";

/**
 * Runtime Vuetify instance created by {@link createVuetify}.
 *
 * This is the actual plugin instance installed into Vue Test Utils
 * via `global.plugins`.
 *
 * @see {@link createVuetify}
 */
export type VuetifyInstance = ReturnType<typeof createVuetify>;

/**
 * Configuration options for the Vuetify test plugin.
 *
 * This interface combines standard Vuetify initialization settings
 * with TestForge plugin control options such as `expose()`.
 *
 * @see {@link VuetifyOptions} from the `vuetify` package for theme,
 * icon, component and directive configuration.
 *
 * @see {@link PluginControlOptions} from `@testforgejs/vue-test-core`
 * for instance interception and testing helpers.
 */
export interface VueTestVuetifyOptions
  extends VuetifyOptions, PluginControlOptions<VuetifyInstance> {}
