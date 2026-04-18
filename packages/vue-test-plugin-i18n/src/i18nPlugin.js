import { createI18nPlugin } from './createI18nPlugin'

/** @type {import('@testforge/vue-test-core').PluginModule} */
export const i18nPlugin = {
    getName: () => 'i18n',
    getDefinition: () => ({
        create: createI18nPlugin,
    }),
}
