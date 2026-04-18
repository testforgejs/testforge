import { createRouterPlugin } from './createRouterPlugin'

/** @type {import('@testforge/vue-test-core').PluginModule} */
export const routerPlugin = {
    getName: () => 'router',
    getDefinition: () => ({
        create: createRouterPlugin,
    }),
}
