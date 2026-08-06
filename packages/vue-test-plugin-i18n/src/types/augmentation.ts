import type {} from "@testforgejs/vue-test-core";
import type { VueTestI18nOptions } from "./types";

/**
 * TestForge core type augmentation for Vue I18n integration.
 *
 * This module registers the i18n configuration under the global plugin options map,
 * enabling full type safety when defining internationalization options in tests.
 *
 * @module I18nAugmentation
 */
declare module "@testforgejs/vue-test-core" {
  /**
   * Global map for TestForge plugin configuration options.
   */
  interface PluginOptionsMap {
    /**
     * Configuration for the `i18n` plugin.
     * Accepts a {@link VueTestI18nOptions} object to manage localization and translations.
     *
     * @example
     * ```ts
     * factory({}, {
     *   plugins: {
     *     i18n: {
     *       locale: "en",
     *       messages: { en: { hello: "Hello World" } }
     *     }
     *   }
     * });
     * ```
     */
    i18n: VueTestI18nOptions;
  }
}
