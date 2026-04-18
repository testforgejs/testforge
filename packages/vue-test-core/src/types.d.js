// === 1. Basic plugin types ===

/**
 * Plugin name (e.g., ‘pinia’, ‘i18n’, ‘router’)
 * @typedef {string} PluginName
 */

/**
 * Allows tests to capture the instance created by a plugin.
 *
 * @callback ExposePluginInstance
 * @param {any} instance
 */

// === 2. Options for specific plugins ===

/**
 * Pinia store mocking callback.
 * Gives access to the active Pinia instance so the test can mutate stores.
 *
 * @callback MockStoresFn
 * @param {import('pinia').Pinia} pinia
 */

/**
 * @typedef {Object} PiniaPluginOptions
 * @property {Object} [initialState] - Initial state of the Pinia store.
 * @property {boolean} [stubActions=false] - Whether to stub store actions.
 * @property {Function} [createSpy] - Custom spy function (e.g., jest.fn).
 *
 * Called after Pinia is created and activated.
 * Can be used to access and override stores.
 *
 * @property {MockStoresFn} [mockStores]
 * @property {ExposePluginInstance} [expose] - Callback to capture plugin instance.
 */

/**
 * @typedef {Object} I18nPluginOptions
 * @property {string} [locale] - Current locale.
 * @property {Object} [messages] - Translation messages.
 * @property {boolean} [legacy=false] - Whether to use legacy mode.
 * @property {ExposePluginInstance} [expose] - Callback to capture plugin instance.
 */

/**
 * @typedef {Object} RouterPluginOptions
 * @property {import('vue-router').RouteRecordRaw[]} [routes]
 * @property {string} [initialRoute]
 * @property {ExposePluginInstance} [expose] - Callback to capture plugin instance.
 */

// === 3. Registry and Modular Plugin System ===

/**
 * Plugin lifecycle definition.
 *
 * @template TOptions
 * @template TInstance
 *
 * @typedef {Object} PluginDefinition
 * @property {function(options: TOptions): TOptions} [beforeCreate]
 * Optional hook to transform plugin options before creation.
 *
 * @property {function(options: TOptions): TInstance} create
 * Factory function that creates plugin instance.
 *
 * @property {function(instance: TInstance, ctx: MountContext): void} [afterCreate]
 * Optional hook executed after plugin instance is created.
 */

/**
 * A plugin module that encapsulates its name and factory.
 *
 * @typedef {Object} PluginModule
 * @property {function(): PluginName} getName
 * @property {function(): PluginDefinition<any, any>} getDefinition
 */

/**
 * Plugin Registry.
 *
 * @template {PluginDefinition<any, any>} T
 * @typedef {Object} PluginRegistry
 * @property {function(PluginModule): void} register
 * @property {function(PluginName): T|undefined} get
 * @property {function(PluginName): boolean} has
 * @property {function(): PluginName[]} getNames
 * @property {function(): IterableIterator<[PluginName, T]>} entries
 */

/**
 * Map of supported plugins.
 * Key — the plugin name (for example, ‘pinia’, ‘i18n’).
 * Value — the default configuration object or `false` to disable it.
 *
 * @typedef {Record<PluginName, Object|boolean>} SupportedPluginsMap
 */

// === 4. Pipeline Context ===

/**
 * Initial data for creating mount context.
 *
 * @typedef {Object} CreateMountContextParams
 * @property {Object} [defaultMountOptions] - Base mount options (factory defaults)
 * @property {Object} [mountOptions] - User-provided mount options
 * @property {Object} [extraOptions] - Additional options (e.g. pinia, i18n, router config)
 * @property {Object} [presets] - Presets
 */

/**
 * Result state accumulated during pipeline execution.
 *
 * @typedef {Object} MountContextResult
 * @property {Object} mountOptions - Flat mount options
 * @property {Object} global - Vue Test Utils global config
 * @property {Object.<string, any>} pluginPresets - Plugin preset configuration
 * @property {Object.<string, any>} plugins - Plugin configuration
 */

/**
 * Full mount context passed through pipeline.
 *
 * @typedef {Object} MountContext
 * @property {Object} defaultMountOptions
 * @property {Object} mountOptions
 * @property {Object} extraOptions
 * @property {SupportedPluginsMap} supportedPlugins
 * @property {Object} preset
 * @property {MountContextResult} result
 */

/**
 * Middleware for the pipeline.
 * @callback PipelineMiddleware
 * @param {MountContext} ctx
 * @returns {void | MountContext}
 */

// === 5. Component Factory Options ===

/**
 * A basic interface for the options of any plugin.
 * @typedef {Object|boolean} BasePluginOption
 */

/**
 * Strictly typed options for well-known plugins.
 *
 * @typedef {Object} KnownPluginOptions
 * @property {PiniaPluginOptions | boolean} [pinia]
 * @property {I18nPluginOptions | boolean} [i18n]
 * @property {RouterPluginOptions | boolean} [router]
 */

/**
 * Options for creating plugins in test utils.
 * @typedef {KnownPluginOptions & Object.<string, BasePluginOption>} PluginOptions
 */

/**
 * Options passed to the component factory in tests.
 * @typedef {Object} ComponentFactoryOptions
 * @property {boolean} [useShallow]
 * @property {PluginOptions} [plugins]
 * @property {boolean} [skipManagedPlugins]
 * @property {Object} [props]
 * @property {Object} [attrs]
 * @property {Object} [slots]
 * @property {Object} [global]
 */

/**
 * @template T
 * @callback ComponentFactory
 * @param {Object} [props] - Component props
 * @param {ComponentFactoryOptions} [mountOptions] - Mounting options
 * @param {Object} [slots] - Slots
 * @param {Object} [extraOptions] - Additional flags (skipDefaultProps, etc.)
 * @returns {import('@vue/test-utils').VueWrapper<InstanceType<T>>}
 */

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
