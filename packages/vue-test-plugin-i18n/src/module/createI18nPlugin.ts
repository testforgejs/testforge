import { createPluginInstance } from "@testforge/vue-test-core";
import { createI18n } from "vue-i18n";

import type { I18n } from "vue-i18n";
import type { VueTestI18nOptions } from "../types/types";

/*
 * Creates a Vue I18n plugin instance.
 *
 * Extracted into a separate factory to simplify testing and mocking.
 */
export function createI18nPlugin(options: VueTestI18nOptions): I18n {
  return createPluginInstance<I18n, VueTestI18nOptions>(createI18n, options);
}
