/**
 * Vue Router integration for TestForge.
 *
 * Provides a managed Vue Router plugin module, typed routing configuration,
 * and the standardized TestForge plugin package contract.
 *
 * Standardized package exports:
 * - `plugin` — alias of {@link routerPlugin}.
 * - `PLUGIN_NAME` — stable identifier for the managed Vue Router plugin.
 * - `PluginOptions` — type-only alias of {@link VueTestRouterOptions}.
 *
 * The descriptive `routerPlugin` and `VueTestRouterOptions` exports
 * remain available for direct use.
 *
 * @packageDocumentation
 */

import "./types/augmentation.js";

// Plugin module
export { routerPlugin, routerPlugin as plugin } from "./module/routerPlugin.js";

// Plugin identifier
export { ROUTER_PLUGIN_NAME as PLUGIN_NAME } from "./constants/constants.js";

// Plugin types
export * from "./types/types.js";

// Standardized public options type
export type { VueTestRouterOptions as PluginOptions } from "./types/types.js";
