import type { I18n, I18nOptions } from "vue-i18n";
import type { RuntimePluginOptions } from "@testforgejs/vue-test-core";

/**
 * Configuration options for the Vue I18n test plugin.
 *
 * Uses native Vue I18n options for configuring the i18n instance
 * created by TestForge.
 *
 * Managed instance controls are provided separately by TestForge
 * through its plugin configuration types.
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
 * @see `I18nOptions` from `vue-i18n` for configuring locales,
 * fallback languages, and translation messages.
 */
export type VueTestI18nOptions = I18nOptions;

/**
 * Resolved runtime options for the managed Vue I18n test plugin.
 *
 * Combines {@link VueTestI18nOptions} with the internal TestForge
 * controls used to create, reuse, and expose an {@link I18n} instance.
 *
 * These options are passed to `createI18nPlugin()` after the Mount Pipeline
 * has resolved the plugin configuration.
 *
 * Input metadata provided through `withPluginInstance()` is processed
 * before this stage and is not part of the resolved runtime options.
 *
 * @internal
 *
 * @see {@link VueTestI18nOptions}
 * @see `RuntimePluginOptions` from `@testforgejs/vue-test-core`.
 */
export type I18nRuntimeOptions = RuntimePluginOptions<I18n, VueTestI18nOptions>;
