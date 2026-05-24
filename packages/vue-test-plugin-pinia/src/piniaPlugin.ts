import { createPiniaPlugin } from "./createPiniaPlugin.js";

import type { Pinia } from "pinia";
import type { PluginModule, PiniaPluginOptions } from "@testforge/vue-test-core";

export const piniaPlugin: PluginModule<Pinia, PiniaPluginOptions> = {
  getName: () => "pinia",
  getDefinition: () => ({
    // beforeCreate(ctx, options) {
    //     return {
    //         ...defaultPinia,
    //         ...options,
    //     }
    // },
    create: createPiniaPlugin,
    // afterCreate(instance, ctx) {},
  }),
};
