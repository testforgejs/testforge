import { createPiniaPlugin } from "./createPiniaPlugin.js";
import { setActivePinia } from "pinia";
import { defaultOptions } from "../defaults.js";
import { PINIA_PLUGIN_NAME } from "../constants/constants.js";

import type { TestingPinia } from "@pinia/testing";
import type { VueTestPiniaOptions } from "../types/types.js";
import type { PluginModuleWithDefaults } from "@testforgejs/vue-test-core";

/**
 * Managed Pinia testing plugin module for TestForge.
 *
 * Provides the runtime definition for creating or reusing testing Pinia
 * instances and exposes a default configuration factory
 * that presets can explicitly opt into.
 */
export const piniaPlugin: PluginModuleWithDefaults<TestingPinia, VueTestPiniaOptions> = {
  getName: () => PINIA_PLUGIN_NAME,
  getDefinition: () => ({
    // beforeCreate(ctx, options) {
    //     return {
    //         ...defaultPinia,
    //         ...options,
    //     }
    // },
    create: createPiniaPlugin,
    // Automatically sets the active Pinia instance for current test context.
    afterCreate(instance) {
      setActivePinia(instance);
    },
    supportsInstanceReferences: true,
  }),
  getDefaultOptions: defaultOptions,
};
