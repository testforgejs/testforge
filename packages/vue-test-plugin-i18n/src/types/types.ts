import type { I18n, I18nOptions } from "vue-i18n";
import type { PluginControlOptions } from "@testforgejs/vue-test-core";

/**
 * Configuration options for the Vue I18n test plugin.
 *
 * Combines standard Vue I18n configuration (`I18nOptions` from `vue-i18n`)
 * with TestForge plugin control options.
 *
 * @example
 * Configure the managed Vue I18n plugin for a component test:
 *
 * ```ts
 * factory({}, {
 *   plugins: {
 *     i18n: {
 *       locale: "en",
 *       messages: {
 *         en: {
 *           hello: "Hello World",
 *         },
 *       },
 *     },
 *   },
 * });
 * ```
 *
 * @see {@link I18nOptions} for configuring locales, fallback languages, and translation messages.
 * @see {@link PluginControlOptions} for instance capturing and exposure mechanisms.
 */
export type VueTestI18nOptions = I18nOptions & PluginControlOptions<I18n>;
