import type { Router, RouterOptions } from "vue-router";
import type { RuntimePluginOptions } from "@testforgejs/vue-test-core";

/**
 * Configuration options for the Vue Router test plugin.
 *
 * Uses native Vue Router options for configuring the router instance
 * created by TestForge.
 *
 * Managed instance controls are provided separately by TestForge
 * through its plugin configuration types.
 *
 * @example
 * Configure the managed Vue Router plugin for a component test:
 *
 * ```ts
 * factory({}, {
 *   plugins: {
 *     router: {
 *       history: createMemoryHistory(),
 *       routes: [],
 *     },
 *   },
 * });
 * ```
 *
 * @see `RouterOptions` from `vue-router` for native Vue Router configuration.
 */
export type VueTestRouterOptions = RouterOptions;

/**
 * Resolved runtime options for the managed Vue Router test plugin.
 *
 * Combines {@link VueTestRouterOptions} with the internal TestForge
 * controls used to create, reuse, and expose a {@link Router} instance.
 *
 * These options are passed to `createRouterPlugin()` after the Mount Pipeline
 * has resolved the plugin configuration.
 *
 * Input metadata provided through `withPluginInstance()` is processed
 * before this stage and is not part of the resolved runtime options.
 *
 * @internal
 *
 * @see {@link VueTestRouterOptions}
 * @see `RuntimePluginOptions` from `@testforgejs/vue-test-core`.
 */
export type RouterRuntimeOptions = RuntimePluginOptions<Router, VueTestRouterOptions>;
