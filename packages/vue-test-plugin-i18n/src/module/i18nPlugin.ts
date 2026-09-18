import { createI18nPlugin } from "./createI18nPlugin";
import { defaultOptions } from "../defaults.js";

import type { I18n } from "vue-i18n";
import type { VueTestI18nOptions } from "../types/types";
import type { PluginModuleWithDefaults } from "@testforgejs/vue-test-core";

/**
 * Vue I18n plugin module definition for the TestForge framework.
 * Automatically handles internationalization setup inside test environments.
 */
export const i18nPlugin: PluginModuleWithDefaults<I18n, VueTestI18nOptions> = {
  getName: () => "i18n",

  getDefinition: () => ({
    create: createI18nPlugin,
  }),

  getDefaultOptions: defaultOptions,
};
