import type { I18n, I18nOptions } from "vue-i18n";
import type { PluginControlOptions } from "@testforge/vue-test-core";

/**
 * Configuration options for the Vue I18n test plugin.
 *
 * This interface integrates standard internationalization parameters (`I18nOptions` from `vue-i18n`)
 * with TestForge test kernel control options.
 *
 * @see {@link I18nOptions} for configuring locales, fallback languages, and translation messages.
 * @see {@link PluginControlOptions} for instance capturing and exposure mechanisms.
 */
export type VueTestI18nOptions = I18nOptions & PluginControlOptions<I18n>;
