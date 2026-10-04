import { createPrimeVuePlugin } from "./createPrimeVuePlugin.js";
import { defaultOptions } from "../defaults.js";
import { PRIMEVUE_V3_PLUGIN_NAME } from "../constants/constants.js";

import type { PluginModuleWithDefaults } from "@testforgejs/vue-test-core";
import type { VueTestPrimeVueOptions, PrimeVueMountPlugin } from "../types/types";

/**
 * Managed PrimeVue plugin module for TestForge.
 *
 * Provides the runtime integration for mounting PrimeVue 3 as an install-based
 * Vue plugin and exposes the default configuration used by TestForge-managed presets.
 */
export const primeVuePlugin: PluginModuleWithDefaults<PrimeVueMountPlugin, VueTestPrimeVueOptions> =
  {
    getName: () => PRIMEVUE_V3_PLUGIN_NAME,

    getDefinition: () => ({
      create: createPrimeVuePlugin,
    }),

    getDefaultOptions: defaultOptions,
  };
