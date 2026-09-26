import { createPiniaPlugin } from "./createPiniaPlugin.js";
import { setActivePinia } from "pinia";
import { defaultOptions } from "../defaults.js";
import { PINIA_PLUGIN_NAME } from "../constants/constants.js";

import type { Pinia } from "pinia";
import type { VueTestPiniaOptions } from "../types/types";
import type { PluginModuleWithDefaults } from "@testforgejs/vue-test-core";

export const piniaPlugin: PluginModuleWithDefaults<Pinia, VueTestPiniaOptions> = {
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
  }),
  getDefaultOptions: defaultOptions,
};
