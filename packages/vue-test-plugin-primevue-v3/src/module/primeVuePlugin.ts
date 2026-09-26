import { createPrimeVuePlugin } from "./createPrimeVuePlugin.js";
import { defaultOptions } from "../defaults.js";
import { PRIMEVUE_V3_PLUGIN_NAME } from "../constants/constants.js";

import type { PluginModuleWithDefaults } from "@testforgejs/vue-test-core";
import type { VueTestPrimeVueOptions, PrimeVueMountPlugin } from "../types/types";

/**
 * Official TestForge integration module for PrimeVue 3.
 *
 * Registers PrimeVue 3 in the TestForge plugin pipeline and exposes
 * the `primevueV3` configuration key for presets and mount options.
 */
export const primeVuePlugin: PluginModuleWithDefaults<PrimeVueMountPlugin, VueTestPrimeVueOptions> =
  {
    /**
     * Returns the plugin identifier used in TestForge configuration.
     *
     * @returns The plugin registration key (`"primevueV3"`).
     */
    getName: () => PRIMEVUE_V3_PLUGIN_NAME,

    /**
     * Returns the PrimeVue 3 plugin lifecycle definition.
     *
     * @returns Plugin lifecycle hooks consumed by the TestForge kernel.
     */
    getDefinition: () => ({
      create: createPrimeVuePlugin,
    }),

    /**
     * Creates the default PrimeVue 3 options used by TestForge.
     *
     * @returns A factory that creates the default PrimeVue 3 options.
     */
    getDefaultOptions: defaultOptions,
  };
