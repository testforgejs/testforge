import { createI18nPlugin } from "./createI18nPlugin.js";

import type { I18n } from "vue-i18n";
import type { PluginModule, I18nPluginOptions } from "@testforge/vue-test-core";

/*
 * Vue I18n plugin module definition.
 */
export const i18nPlugin: PluginModule<I18n, I18nPluginOptions> = {
  getName: () => "i18n",

  getDefinition: () => ({
    create: createI18nPlugin,
  }),
};
