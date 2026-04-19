import { createPiniaPlugin } from "./createPiniaPlugin.js";

/** @type {import('@testforge/vue-test-core').PluginModule} */
export const piniaPlugin = {
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
