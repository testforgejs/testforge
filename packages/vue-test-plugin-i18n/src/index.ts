/**
 * Vue I18n integration for TestForge.
 *
 * Provides a managed Vue I18n plugin module, typed configuration,
 * and the standardized TestForge plugin package contract.
 *
 * @packageDocumentation
 */
import "./types/augmentation.js";

export { i18nPlugin, i18nPlugin as plugin } from "./module/i18nPlugin.js";

export { I18N_PLUGIN_NAME as PLUGIN_NAME } from "./constants/constants.js";

export * from "./types/types";
