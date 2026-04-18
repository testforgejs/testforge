import { mount, shallowMount } from '@vue/test-utils'
import { createPlugins } from './pluginsRegistry/createPlugins'

/**
 * Mounts a component with required plugins
 * @param {object} component - Vue Component
 * @param {MountContext} ctx - Mount context
 * @param {object} overrides - Override mounting options
 * @returns {import('@vue/test-utils').VueWrapper}
 */
export function mountWithPlugins(component, ctx, overrides = {}) {
    const { result } = ctx

    const mergedOptions = {
        ...result.mountOptions,
        ...overrides,
        plugins: result.plugins,
        global: result.global,
    }

    const {
        useShallow = true,
        plugins = {},
        skipManagedPlugins = false,
        ...restOptions
    } = mergedOptions

    const globalPlugins = skipManagedPlugins ? [] : createPlugins(plugins, ctx)
    const mountFunction = useShallow ? shallowMount : mount

    const finalGlobal = restOptions.global || {}

    if (globalPlugins.length > 0) {
        finalGlobal.plugins = [...(finalGlobal.plugins || []), ...globalPlugins]
    }

    return mountFunction(component, {
        ...restOptions,
        global: finalGlobal,
    })
}
