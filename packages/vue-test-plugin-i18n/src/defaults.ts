import type { PluginDefaultOptionsFactory } from "@testforgejs/vue-test-core";
import type { VueTestI18nOptions } from "./types/types";

/**
 * Creates the default Vue I18n options used by TestForge.
 *
 * Uses Composition API mode and enables global injection to provide
 * consistent component integration across supported Vue I18n versions
 * without defining project-specific localization behavior.
 *
 * @returns A factory that creates the default Vue I18n options.
 */
export const defaultOptions: PluginDefaultOptionsFactory<VueTestI18nOptions> = () => () => ({
  legacy: false,
  globalInjection: true,
});
