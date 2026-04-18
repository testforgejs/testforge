/**
 * @typedef {Object} PluginManifestEntry
 * @property {PluginModule} module - Plugin module instance (piniaPlugin, i18nPlugin, etc.)
 * @property {boolean} enabled - The default plugin activation flag in this preset
 */

/**
 * @typedef {Object} PresetDefinition
 * @property {PluginManifestEntry[]} manifest - List of available plugins and their status
 * @property {Object.<string, Object|boolean>} defaults - Default options for each plugin based on its name,
 *   or “false” to disable it
 */

/**
 * @typedef {Object.<string, PresetDefinition>} TestFrameworkPresets
 */
