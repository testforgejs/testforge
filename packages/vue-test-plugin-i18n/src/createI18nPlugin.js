import { createPluginInstance } from '@testforge/vue-test-core'
import { createI18n } from 'vue-i18n'

/**
 * Factory for creating a Vue I18n plugin instance.
 * Separated from the plugin definition to allow easy mocking in integration tests.
 *
 * @param {I18nPluginOptions} options - Configuration for the i18n plugin.
 * @returns {import('vue-i18n').I18n}
 */
export function createI18nPlugin(options) {
    return createPluginInstance(createI18n, options)
}
