import type { Router, RouterOptions } from "vue-router";
import type { PluginControlOptions } from "@testforgejs/vue-test-core";

/**
 * Configuration options for the Vue Router test plugin.
 *
 * Combines native Vue Router options with TestForge-specific
 * controls for managed plugin instances.
 *
 * TestForge control options are handled internally and are not
 * forwarded to the native Vue Router factory.
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
 * @see `PluginControlOptions` from `@testforgejs/vue-test-core` for type-safe instance capturing.
 */
export type VueTestRouterOptions = RouterOptions & PluginControlOptions<Router>;
