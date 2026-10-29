import { createI18nPlugin } from "./createI18nPlugin";
import { defaultOptions } from "../defaults.js";
import { I18N_PLUGIN_NAME } from "../constants/constants.js";

import type { I18n } from "vue-i18n";
import type { VueTestI18nOptions } from "../types/types.js";
import type { PluginModuleWithDefaults } from "@testforgejs/vue-test-core";

/**
 * Managed Vue I18n plugin module for TestForge.
 *
 * Provides the runtime definition for creating or reusing Vue I18n
 * instances and exposes a default configuration factory
 * that presets can explicitly opt into.
 */
export const i18nPlugin: PluginModuleWithDefaults<I18n, VueTestI18nOptions> = {
  getName: () => I18N_PLUGIN_NAME,

  getDefinition: () => ({
    create: createI18nPlugin,
    supportsInstanceReferences: true,
  }),

  getDefaultOptions: defaultOptions,
};
