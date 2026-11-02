/**
 * Pinia testing integration for TestForge.
 *
 * Provides a managed Pinia plugin module, typed testing configuration,
 * store setup helpers, and the standardized TestForge plugin package contract.
 *
 * Standardized package exports:
 * - `plugin` — alias of {@link piniaPlugin}.
 * - `PLUGIN_NAME` — stable identifier for the managed Pinia plugin.
 * - `PluginOptions` — type-only alias of {@link VueTestPiniaOptions}.
 *
 * The descriptive `piniaPlugin` and `VueTestPiniaOptions` exports
 * remain available for direct use.
 *
 * @packageDocumentation
 */

import "./types/augmentation.js";

// Plugin module
export { piniaPlugin, piniaPlugin as plugin } from "./module/piniaPlugin.js";

// Plugin identifier
export { PINIA_PLUGIN_NAME as PLUGIN_NAME } from "./constants/constants.js";

// Store setup helper
export { withMockStores } from "./helpers/withMockStores.js";

// Plugin types
export * from "./types/types.js";

// Standardized public options type
export type { VueTestPiniaOptions as PluginOptions } from "./types/types.js";
