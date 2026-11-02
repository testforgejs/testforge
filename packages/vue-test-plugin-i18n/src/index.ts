/**
 * Vue I18n integration for TestForge.
 *
 * Provides a managed Vue I18n plugin module, typed configuration,
 * and the standardized TestForge plugin package contract.
 *
 * Standardized package exports:
 * - `plugin` — alias of {@link i18nPlugin}.
 * - `PLUGIN_NAME` — stable identifier for the managed Vue I18n plugin.
 * - `PluginOptions` — type-only alias of {@link VueTestI18nOptions}.
 *
 * The descriptive `i18nPlugin` and `VueTestI18nOptions` exports
 * remain available for direct use.
 *
 * @packageDocumentation
 */

import "./types/augmentation.js";

// Plugin module
export { i18nPlugin, i18nPlugin as plugin } from "./module/i18nPlugin.js";

// Plugin identifier
export { I18N_PLUGIN_NAME as PLUGIN_NAME } from "./constants/constants.js";

// Plugin types
export * from "./types/types.js";

// Standardized public options type
export type { VueTestI18nOptions as PluginOptions } from "./types/types.js";
