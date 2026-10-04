/**
 * Vue Router integration for TestForge.
 *
 * Provides a managed Vue Router plugin module, typed routing configuration,
 * and the standardized TestForge plugin package contract.
 *
 * @packageDocumentation
 */

import "./types/augmentation.js";

export { routerPlugin, routerPlugin as plugin } from "./module/routerPlugin.js";
export { ROUTER_PLUGIN_NAME as PLUGIN_NAME } from "./constants/constants.js";
export * from "./types/types";
