/**
 * Validates plugin configurations in result.plugins and extraOptions.
 * @type {PipelineMiddleware}
 */
export const assertPluginOptions = (ctx) => {
    const { supportedPlugins, extraOptions } = ctx
    const { plugins } = ctx.result

    const ALLOWED_PLUGINS = Object.keys(supportedPlugins)

    /**
     * @param {any} val
     * @param {string} name
     * @param {string} source
     */
    const validate = (val, name, source) => {
        // 1. Check whether the plugin is permitted by manifest
        if (source !== 'extraOptions' && !ALLOWED_PLUGINS.includes(name)) {
            throw new Error(
                `[TestFramework] Unknown plugin "${name}" detected in ${source}.`
            )
        }

        // 2. Type validation: Only {} or false are allowed.
        // null, arrays, and primitives (except false) are not allowed.
        const isObject =
            val !== null && typeof val === 'object' && !Array.isArray(val)
        const isValid = val === undefined || val === false || isObject

        if (!isValid) {
            throw new Error(
                `[TestFramework] Invalid configuration for plugin "${name}" in ${source}. ` +
                    `Expected Object or Boolean (false), but received ${typeof val} (${val}).`
            )
        }
    }

    // Check what was merged in withPluginsBase (from the default and mount options)
    Object.entries(plugins).forEach(([name, value]) => {
        validate(value, name, 'plugins')
    })

    // Check the keys in `extraOptions` that match the plugin names
    ALLOWED_PLUGINS.forEach((name) => {
        if (Object.prototype.hasOwnProperty.call(extraOptions, name)) {
            validate(extraOptions[name], name, 'extraOptions')
        }
    })
}
