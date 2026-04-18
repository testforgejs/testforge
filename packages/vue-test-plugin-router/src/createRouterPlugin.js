import { createPluginInstance } from '@testforge/vue-test-core'
import { createRouter } from 'vue-router'

/**
 * Factory for creating a Vue Router plugin instance.
 * Separated from the plugin definition to allow easy mocking in integration tests.
 *
 * @param {RouterPluginOptions} options - Configuration for the router plugin.
 * @returns {import('vue-router').Router}
 */
export function createRouterPlugin(options) {
    return createPluginInstance(createRouter, options)
}
