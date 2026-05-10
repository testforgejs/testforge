/**
 * Merges plugin presets with the current plugin configuration.
 *
 * Presets act as a base, while existing configuration in `ctx.result.plugins`
 * takes priority. If a plugin is explicitly set to `false`, it remains disabled.
 *
 * @param {MountContext} ctx - Current pipeline context
 * @param {PluginName} name - Name of the plugin to merge
 *
 * @returns {MountContext} Updated context (same reference)
 */
export function mergePluginPresets(ctx, name) {
  const { result } = ctx;

  if (result.plugins[name] !== false) {
    result.plugins[name] = {
      ...(result.pluginPresets[name] || {}),
      ...(result.plugins[name] || {}),
    };
  }

  return ctx;
}
