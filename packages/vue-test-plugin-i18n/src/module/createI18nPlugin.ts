import { createPluginInstance } from "@testforgejs/vue-test-core";
import { createI18n } from "vue-i18n";

import type { I18n, I18nOptions } from "vue-i18n";
import type { I18nRuntimeOptions } from "../types/types";

/*
 * Creates or reuses a managed Vue I18n instance.
 *
 * Internal TestForge controls are excluded from the native
 * createI18n() options by createPluginInstance().
 */
export function createI18nPlugin(options: I18nRuntimeOptions): I18n {
  return createPluginInstance<I18n, I18nOptions>(createI18n, options);
}
