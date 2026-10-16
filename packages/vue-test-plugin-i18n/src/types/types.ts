import type { I18n, I18nOptions } from "vue-i18n";
import type { PluginControlOptions } from "@testforgejs/vue-test-core";

/**
 * Configuration options for the Vue I18n test plugin.
 *
 * Combines native Vue I18n options with TestForge-specific
 * controls for managed plugin instances.
 *
 * TestForge control options are validated as part of the plugin
 * configuration and are not forwarded to the native Vue I18n factory.
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
 * @see `I18nOptions` from `vue-i18n` for configuring locales, fallback languages, and translation messages.
 * @see `PluginControlOptions` from `@testforgejs/vue-test-core` for instance capturing and exposure mechanisms.
 */
export type VueTestI18nOptions = I18nOptions & PluginControlOptions<I18n>;
