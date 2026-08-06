import { createPiniaPlugin } from "./createPiniaPlugin.js";
import { setActivePinia } from "pinia";

import type { Pinia } from "pinia";
import type { VueTestPiniaOptions } from "../types/types";
import type { PluginModule } from "@testforgejs/vue-test-core";

export const piniaPlugin: PluginModule<Pinia, VueTestPiniaOptions> = {
  getName: () => "pinia",
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
};
