import { createPrimeVuePlugin } from "./createPrimeVuePlugin.js";
import { defaultOptions } from "../defaults.js";
import { PRIMEVUE_PLUGIN_NAME } from "../constants/constants.js";

import type { PluginModuleWithDefaults } from "@testforgejs/vue-test-core";
import type { VueTestPrimeVueOptions, PrimeVueMountPlugin } from "../types/types.js";

/**
 * Install-based PrimeVue plugin module for TestForge.
 *
 * Provides the runtime definition for mounting PrimeVue through
 * Vue Test Utils and exposes a default configuration factory
 * that presets can explicitly opt into.
 */
export const primeVuePlugin: PluginModuleWithDefaults<PrimeVueMountPlugin, VueTestPrimeVueOptions> =
  {
    getName: () => PRIMEVUE_PLUGIN_NAME,

    getDefinition: () => ({
      create: createPrimeVuePlugin,
    }),

    getDefaultOptions: defaultOptions,
  };
