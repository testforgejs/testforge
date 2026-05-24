import { createPluginInstance } from "@testforge/vue-test-core";
import { createI18n } from "vue-i18n";

import type { I18n } from "vue-i18n";
import type { I18nPluginOptions, PluginFactoryOptions } from "@testforge/vue-test-core";

/*
 * Creates a Vue I18n plugin instance.
 *
 * Extracted into a separate factory to simplify testing and mocking.
 */
export function createI18nPlugin(options: PluginFactoryOptions<I18n, I18nPluginOptions>): I18n {
  return createPluginInstance<I18n, I18nPluginOptions>(createI18n, options);
}
