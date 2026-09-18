import type { PluginDefaultOptionsFactory } from "@testforgejs/vue-test-core";
import type { VueTestI18nOptions } from "./types/types";

/**
 * Creates the default Vue I18n options used by TestForge.
 *
 * Configures Vue I18n for Composition API usage with an English locale,
 * an empty message catalog, and translation warnings disabled to provide
 * a quiet, project-independent testing environment.
 *
 * @returns A factory that creates the default Vue I18n options.
 */
export const defaultOptions: PluginDefaultOptionsFactory<VueTestI18nOptions> = () => () => ({
  legacy: false,
  locale: "en",
  fallbackLocale: "en",
  messages: {},
  fallbackWarn: false,
  missingWarn: false,
});
