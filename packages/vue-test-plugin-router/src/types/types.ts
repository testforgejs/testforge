import type { Router, RouterOptions } from "vue-router";
import type { PluginControlOptions } from "@testforge/vue-test-core";

/**
 * Configuration options for the Vue Router test plugin.
 *
 * This interface integrates standard router initialization settings
 * and TestForge test kernel control options (such as `expose`).
 *
 * @see {@link RouterOptions} from the `vue-router` package for configuring routes and history.
 * @see {@link PluginControlOptions} from the `@testforge/vue-test-core` package for instance interception.
 */
export interface VueTestRouterOptions extends RouterOptions, PluginControlOptions<Router> {}
