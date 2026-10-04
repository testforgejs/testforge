import type { Router, RouterOptions } from "vue-router";
import type { PluginControlOptions } from "@testforgejs/vue-test-core";

/**
 * Configuration options for the Vue Router test plugin.
 *
 * Combines standard Vue Router configuration (`RouterOptions` from `vue-router`)
 * with TestForge plugin control options.
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
 * @see `RouterOptions` from `vue-router` for configuring routes and history.
 * @see `PluginControlOptions` from `@testforgejs/vue-test-core` for instance capturing and exposure mechanisms.
 */
export type VueTestRouterOptions = RouterOptions & PluginControlOptions<Router>;
