/**
 * @typedef {object} PluginManifestEntry
 * @property {PluginModule} module - Plugin module instance (piniaPlugin, i18nPlugin, etc.)
 * @property {boolean} enabled - The default plugin activation flag in this preset
 */

/**
 * @typedef {object} PresetDefinition
 * @property {PluginManifestEntry[]} manifest - List of available plugins and their status
 * @property {{[key: string]: object|boolean}} defaults - Default options for each plugin based on its name,
 *   or “false” to disable it
 */

/**
 * @typedef {{[key: string]: PresetDefinition}} TestFrameworkPresets
 */
