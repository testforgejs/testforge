import type { createVuetify, VuetifyOptions } from "vuetify";
import type { RuntimePluginOptions } from "@testforgejs/vue-test-core";

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
 * Uses native Vuetify options for configuring the Vuetify instance
 * created by TestForge.
 *
 * Managed instance controls are provided separately by TestForge
 * through its plugin configuration types.
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
 */
export type VueTestVuetifyOptions = VuetifyOptions;

/**
 * Resolved runtime options for the managed Vuetify test plugin.
 *
 * Combines {@link VueTestVuetifyOptions} with the internal TestForge
 * controls used to create, reuse, and expose a {@link VuetifyInstance}.
 *
 * These options are passed to `createVuetifyPlugin()` after the Mount Pipeline
 * has resolved the plugin configuration.
 *
 * Input metadata provided through `withPluginInstance()` is processed
 * before this stage and is not part of the resolved runtime options.
 *
 * @internal
 *
 * @see {@link VueTestVuetifyOptions}
 * @see `RuntimePluginOptions` from `@testforgejs/vue-test-core`.
 */
export type VuetifyRuntimeOptions = RuntimePluginOptions<VuetifyInstance, VueTestVuetifyOptions>;
