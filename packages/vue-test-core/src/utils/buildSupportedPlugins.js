/**
 * @param {PresetDefinition} preset
 * @returns {SupportedPluginsMap}
 */
export function buildSupportedPlugins(preset) {
  if (!preset?.manifest) return {};

  return preset.manifest.reduce((acc, { module, enabled }) => {
    const name = module.getName();
    acc[name] = enabled ? {} : false;
    return acc;
  }, {});
}
