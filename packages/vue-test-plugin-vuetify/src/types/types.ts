import type { createVuetify, VuetifyOptions } from "vuetify";
import type { PluginControlOptions } from "@testforgejs/vue-test-core";

/**
 * Vuetify runtime instance created by `createVuetify()`.
 *
 * Represents the managed Vuetify instance used by TestForge
 * during component mounting.
 *
 * @see `createVuetify` from `vuetify` for the native Vuetify instance factory.
 */
export type VuetifyInstance = ReturnType<typeof createVuetify>;

/**
 * Configuration options for the Vuetify test plugin.
 *
 * Combines native Vuetify options with TestForge-specific
 * controls for managed plugin instances.
 *
 * TestForge control options are handled internally and are not
 * forwarded to the native Vuetify factory.
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
 * @see `VuetifyOptions` from `vuetify` for native Vuetify configuration.
 * @see `PluginControlOptions` from `@testforgejs/vue-test-core` for type-safe instance capturing.
 */
export type VueTestVuetifyOptions = VuetifyOptions & PluginControlOptions<VuetifyInstance>;
