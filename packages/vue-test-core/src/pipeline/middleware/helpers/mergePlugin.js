import { mergeResult } from './mergeResult'

/**
 * Safely merges configuration for a specific plugin into the pipeline context.
 *
 * A specialized wrapper around `mergeResult` that handles the nesting
 * for a single plugin. It preserves existing plugin data and applies
 * the new configuration on top.
 *
 * Designed for use inside plugin-specific middleware.
 *
 * @param {MountContext} ctx - Current pipeline context
 * @param {PluginName} name - Name of the plugin to update
 * @param {Object} config - Configuration object to merge for this plugin
 *
 * @returns {MountContext} Updated context (same reference)
 *
 * @example
 * mergePlugin(ctx, 'pinia', { someState: 123 })
 */
export function mergePlugin(ctx, name, config) {
    return mergeResult(ctx, {
        plugins: {
            [name]: {
                ...(ctx.result.plugins[name] || {}),
                ...config,
            },
        },
    })
}
