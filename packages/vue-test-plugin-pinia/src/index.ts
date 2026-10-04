/**
 * Pinia testing integration for TestForge.
 *
 * Provides a managed Pinia plugin module, typed testing configuration,
 * and the standardized TestForge plugin package contract.
 *
 * @packageDocumentation
 */

import "./types/augmentation.js";

export { piniaPlugin, piniaPlugin as plugin } from "./module/piniaPlugin.js";
export { PINIA_PLUGIN_NAME as PLUGIN_NAME } from "./constants/constants.js";
export * from "./types/types";
