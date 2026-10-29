/**
 * Vue Router integration for TestForge.
 *
 * Provides a managed Vue Router plugin module, typed routing configuration,
 * and the standardized TestForge plugin package contract.
 *
 * @packageDocumentation
 */

import "./types/augmentation.js";

// Plugin module
export { routerPlugin, routerPlugin as plugin } from "./module/routerPlugin.js";

// Plugin identifier
export { ROUTER_PLUGIN_NAME as PLUGIN_NAME } from "./constants/constants.js";

// Plugin types
export * from "./types/types";

// Standardized public options type
export type { VueTestRouterOptions as PluginOptions } from "./types/types";
