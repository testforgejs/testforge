/**
 * Pinia testing integration for TestForge.
 *
 * Provides a managed Pinia plugin module, typed testing configuration,
 * and the standardized TestForge plugin package contract.
 *
 * @packageDocumentation
 */

import "./types/augmentation.js";

// Plugin module
export { piniaPlugin, piniaPlugin as plugin } from "./module/piniaPlugin.js";

// Plugin identifier
export { PINIA_PLUGIN_NAME as PLUGIN_NAME } from "./constants/constants.js";

export { withMockStores } from "./helpers/withMockStores.js";

// Plugin types
export * from "./types/types";

// Standardized public options type
export type { VueTestPiniaOptions as PluginOptions } from "./types/types";
