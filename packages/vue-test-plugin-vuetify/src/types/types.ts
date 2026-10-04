import type { createVuetify, VuetifyOptions } from "vuetify";
import type { PluginControlOptions } from "@testforgejs/vue-test-core";

/**
 * Vuetify runtime instance created by createVuetify.
 *
 * Represents the managed Vuetify instance used by TestForge
 * during component mounting.
 *
 * @see `createVuetify` from `vuetify`.
 */
export type VuetifyInstance = ReturnType<typeof createVuetify>;

/**
 * Configuration options for the Vuetify test plugin.
 *
 * Combines standard Vuetify configuration (`VuetifyOptions` from `vuetify`)
 * with TestForge plugin control options.
 *
 * @example
 * Configure the managed Vuetify plugin for a component test:
 *
 * ```ts
 * factory({}, {
 *   plugins: {
 *     vuetify: {
 *       theme: {
 *         defaultTheme: "light",
 *       },
 *     },
 *   },
 * });
 * ```
 *
 * @see `VuetifyOptions` from `vuetify` for theme, icon, component, and directive configuration.
 * @see `PluginControlOptions` from `@testforgejs/vue-test-core` for instance capturing and exposure mechanisms.
 */
export type VueTestVuetifyOptions = VuetifyOptions & PluginControlOptions<VuetifyInstance>;
