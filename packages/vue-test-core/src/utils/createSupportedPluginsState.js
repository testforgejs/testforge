/**
 * Creates the initial plugins state map based on the preset manifest.
 *
 * This function does NOT configure plugins and does NOT apply any defaults.
 * Its only responsibility is to declare which plugins are supported by the
 * current preset and whether they are enabled by default.
 *
 * The result is used as the foundation for the pipeline state where:
 * - `{}`  means "plugin is supported and enabled by default"
 * - `false` means "plugin is supported but disabled by default"
 *
 * Later pipeline middleware (withPluginsBase, withPreset, with<Plugin>)
 * will populate these entries with actual configuration.
 *
 * In other words, this function builds the *structural contract* of the
 * plugins section in the pipeline result before any options are applied.
 *
 * @param {PresetDefinition} preset
 * @returns {SupportedPluginsMap}
 */
export function createSupportedPluginsState(preset) {
  if (!preset?.manifest) return {};

  return preset.manifest.reduce((acc, { module, enabled }) => {
    const name = module.getName();
    acc[name] = enabled ? {} : false;
    return acc;
  }, {});
}
