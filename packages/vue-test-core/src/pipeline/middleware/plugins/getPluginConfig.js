/**
 * Extracts and merges the plugin configuration, taking all priority levels into account.
 *
 * @param {object} ctx - Pipeline Context
 * @param {string} name - Plugin name (pinia, i18n, router)
 * @returns {object|boolean} The configuration object, or `false` if the plugin is disabled
 */
export function getPluginConfig(ctx, name) {
  const { extraOptions } = ctx;
  const { plugins } = ctx.result;

  const isEnabled = extraOptions[name] || (plugins[name] !== false && plugins[name] !== undefined);

  if (!isEnabled) {
    return false;
  }

  const current = plugins[name] || {};
  const extra = extraOptions[name] || {};

  return {
    ...current,
    ...extra,
  };
}
