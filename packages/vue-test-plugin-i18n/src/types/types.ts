import type { I18n, I18nOptions } from "vue-i18n";
import type { PluginControlOptions } from "@testforge/vue-test-core";

export type VueTestI18nOptions = I18nOptions & PluginControlOptions<I18n>;
