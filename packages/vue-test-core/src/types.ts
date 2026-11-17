import type { Component, Plugin } from "vue";
import type { MountingOptions, mount } from "@vue/test-utils";
import type { ComponentProps, ComponentSlots } from "vue-component-type-helpers";

import {
  PLUGIN_EXPOSE,
  PLUGIN_META_KEY,
  SHARED_PLUGIN_INSTANCE_KEY,
} from "./constants/constants.js";

// =============================================================================
// 1. Plugin model and registry
// =============================================================================

/**
 * Identifies a TestForge-managed plugin in manifests and configuration.
 *
 * Plugin names must be unique within a preset manifest.
 */
export type PluginName = string;

/**
 * Plugin value accepted by Vue Test Utils through `global.plugins`.
 *
 * Represents either an installable Vue plugin or a tuple containing
 * the plugin and optional arguments passed to its installation function.
 */
export type MountPlugin = Plugin | [Plugin, ...unknown[]];

/**
 * Factory that produces plugin options when invoked.
 *
 * Used to provide preset-level default configuration for a plugin.
 * Should return fresh mutable configuration data to avoid shared
 * state between independent plugin initializations.
 *
 * @typeParam TOptions - The type of plugin options produced by the factory.
 */
export type PluginOptionsFactory<TOptions> = () => TOptions;

/**
 * Creates a plugin options factory, optionally using test-runner operations.
 *
 * The runner dependency is supplied when this function is called.
 * The returned `PluginOptionsFactory` produces the actual plugin options
 * when invoked, allowing configuration to be created independently.
 *
 * @typeParam TOptions - The type of plugin options produced by
 * the returned factory.
 */
export type PluginDefaultOptionsFactory<TOptions> = (
  runner?: UniversalRunner,
) => PluginOptionsFactory<TOptions>;

/**
 * Test-runner operations available to plugin default-options factories.
 *
 * Provides a common interface for mock and spy operations without
 * depending on Vitest- or Jest-specific types.
 *
 * Mock and spy return types are intentionally runner-agnostic.
 */
export interface UniversalRunner {
  /**
   * Creates a mock function, optionally using the provided implementation.
   */
  fn: <T extends (...args: any[]) => any>(implementation?: T) => any;

  /**
   * Creates a spy on a method of the given object.
   */
  spyOn: <T extends object, M extends keyof T>(
    object: T,
    method: M,
  ) => T[M] extends (...args: any[]) => any ? any : never;

  /**
   * Clears recorded mock calls without resetting mock implementations.
   */
  clearAllMocks: () => any;

  /**
   * Resets mock call history and implementations.
   */
  resetAllMocks: () => any;

  /**
   * Restores original implementations of spied-on methods.
   */
  restoreAllMocks: () => any;
}

/**
 * Defines the creation lifecycle and runtime capabilities of a managed plugin.
 *
 * The framework executes the plugin lifecycle in the following order:
 * `beforeCreate()` → `create()` → `afterCreate()`.
 *
 * Only `create()` is required. The lifecycle hooks allow plugins to
 * transform resolved options and perform initialization after creation.
 *
 * @typeParam TPlugin - The Vue Test Utils-compatible plugin value
 * returned by the creation function.
 * @typeParam TOptions - The options accepted by the plugin's creation
 * function and optional `beforeCreate()` hook.
 */
export interface PluginDefinition<TPlugin extends MountPlugin = MountPlugin, TOptions = unknown> {
  /**
   * Transforms resolved plugin options before creation.
   *
   * Receives the current pipeline context and must return the options
   * passed to `create()`.
   */
  beforeCreate?: (ctx: PipelineContext, options: TOptions) => TOptions;

  /**
   * Creates the plugin value to be installed through Vue Test Utils.
   *
   * Returns a plugin instance or an installable plugin tuple,
   * depending on the plugin integration.
   */
  create: (options: TOptions) => TPlugin;

  /**
   * Runs after the plugin value has been created.
   *
   * Receives the created plugin value and the current pipeline context.
   * Can be used to activate or synchronize plugin-specific runtime state.
   */
  afterCreate?: (plugin: TPlugin, ctx: PipelineContext) => void;

  /**
   * Declares runtime support for deferred managed plugin instance references.
   *
   * Set to `true` only for plugins supporting `fromPluginInstance()`.
   * Requires corresponding type registration in `PluginInstanceMap`.
   */
  supportsInstanceReferences?: true;
}

/**
 * Defines a named TestForge-managed plugin module.
 *
 * Provides a stable plugin identifier and a definition used by the
 * framework to create and initialize the plugin.
 *
 * Optionally exposes a factory for preset-level default configuration.
 *
 * @typeParam TPlugin - The Vue Test Utils-compatible plugin value
 * produced by the module's creation function.
 * @typeParam TOptions - The options accepted by the plugin definition.
 */
export interface PluginModule<TPlugin extends MountPlugin = MountPlugin, TOptions = unknown> {
  /**
   * Returns the stable identifier used to register and configure the plugin.
   *
   * The identifier must be unique within a preset manifest.
   */
  getName(): PluginName;

  /**
   * Returns the plugin creation contract and optional lifecycle hooks.
   */
  getDefinition(): PluginDefinition<TPlugin, TOptions>;

  /**
   * Creates a factory for preset-level default plugin options.
   *
   * Optionally accepts test-runner operations and returns an options
   * factory rather than the configuration object itself.
   */
  getDefaultOptions?: PluginDefaultOptionsFactory<TOptions>;
}

/**
 * Plugin module that guarantees an available default-options factory.
 *
 * Extends `PluginModule` by requiring `getDefaultOptions()`, allowing
 * consumers to obtain a plugin options factory without checking
 * whether the method is defined.
 *
 * @typeParam TPlugin - The Vue Test Utils-compatible plugin value
 * produced by the module's creation function.
 * @typeParam TOptions - The options accepted by the plugin definition
 * and produced by its default-options factory.
 */
export interface PluginModuleWithDefaults<
  TPlugin extends MountPlugin = MountPlugin,
  TOptions = unknown,
> extends PluginModule<TPlugin, TOptions> {
  /**
   * Provides a factory for preset-level default plugin options.
   *
   * May receive test-runner operations and returns an options factory
   * rather than the options object itself.
   */
  getDefaultOptions: PluginDefaultOptionsFactory<TOptions>;
}

/**
 * Declares a TestForge-managed plugin in a preset manifest.
 *
 * Associates a plugin module with its initial enabled state.
 * Disabled plugins remain available for explicit activation
 * through managed plugin configuration.
 *
 * @typeParam TPlugin - The plugin value created by the module.
 * @typeParam TOptions - The options accepted by the module's plugin definition.
 */
export interface PluginManifestEntry<
  TPlugin extends MountPlugin = MountPlugin,
  TOptions = unknown,
> {
  /**
   * Plugin module providing its name, creation contract,
   * and optional default-options factory.
   */
  module: PluginModule<TPlugin, TOptions>;

  /**
   * Whether the plugin is enabled by default in this preset.
   *
   * A value of `false` does not prevent explicit activation
   * through managed plugin configuration.
   */
  enabled: boolean;
}

/** Registry of plugin definitions addressed by plugin name. */
export interface PluginRegistry {
  register(entry: PluginManifestEntry): void;
  get(name: PluginName): PluginDefinition<any, any> | undefined;
  has(name: PluginName): boolean;
  entries(): IterableIterator<[PluginName, PluginDefinition<any, any>]>;
  getNames(): PluginName[];
}

export type SupportedPluginState = boolean;

/** Plugin availability and enabled states for the active mount context. */
export type SupportedPluginsMap = Record<PluginName, SupportedPluginState>;

// =============================================================================
// 2. Plugin type registration and managed instances
// =============================================================================

/**
 * Registry of public configuration types for TestForge plugins.
 *
 * Extend through module augmentation to associate plugin names with
 * their configuration types.
 *
 * Registered names and options are used by `PluginOptionsInput`
 * and `PluginOverridesInput` for type-safe plugin configuration.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface PluginOptionsMap {}

/**
 * Registry of managed plugin instance types.
 *
 * Extend through module augmentation to associate plugin names with
 * their runtime instance types.
 *
 * Registration enables type-safe instance capture and reuse in plugin
 * configuration, and provides valid plugin names and instance types
 * for `fromPluginInstance()`.
 *
 * Only plugins supporting managed instances should be registered.
 * Install-based plugins without managed instances must be excluded.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface PluginInstanceMap {}

/**
 * Names of plugins registered in `PluginInstanceMap`.
 *
 * Restricts managed instance references to registered plugin names,
 * preserving type-safe instance lookup in `fromPluginInstance()`.
 */
export type PluginInstanceName = Extract<keyof PluginInstanceMap, PluginName>;

// Instance capture through a symbol-keyed callback.

/**
 * Optional symbol-keyed callback for capturing a managed plugin instance.
 *
 * Used in managed plugin configuration to receive the instance
 * created or reused during mounting.
 *
 * `captureInstance()` provides this callback without requiring
 * consumers to access the internal symbol.
 *
 * @typeParam TInstance - The type of the managed plugin instance.
 */
export interface ExposeOption<TInstance> {
  /** Receives the newly created or reused plugin instance. */
  [PLUGIN_EXPOSE]?: (instance: TInstance) => void;
}

/**
 * Handle returned by `captureInstance()` for accessing a managed plugin instance.
 *
 * Can be spread into plugin configuration to register an internal
 * instance capture callback.
 *
 * The `instance` property provides access to the captured instance
 * and is excluded from object spreads.
 *
 * @typeParam TInstance - The type of the managed plugin instance to capture.
 */
export interface InstanceCapture<TInstance> {
  /**
   * The most recently captured plugin instance.
   *
   * Returns `undefined` until an instance has been captured.
   */
  readonly instance: TInstance | undefined;

  /** @hidden */
  [PLUGIN_EXPOSE](instance: TInstance): void;
}

// Instance metadata and reuse.

/**
 * Metadata associated with a managed plugin before pipeline resolution.
 *
 * May contain an existing plugin instance to reuse instead of
 * creating a new one.
 *
 * @typeParam TInstance - The type of the managed plugin instance.
 */
export interface PluginMeta<TInstance = unknown> {
  /** Existing plugin instance to reuse, if provided. */
  instance?: TInstance;
}

/**
 * Optional symbol-keyed metadata in unresolved managed plugin configuration.
 *
 * The metadata may contain an existing instance to reuse.
 * Unlike `PluginInstanceInput`, neither the metadata property nor
 * the instance itself is required.
 *
 * @typeParam TInstance - The type of the managed plugin instance.
 */
export interface PluginMetaOptions<TInstance = unknown> {
  /** Instance metadata processed during plugin configuration resolution. */
  [PLUGIN_META_KEY]?: PluginMeta<TInstance>;
}

/**
 * Required instance metadata returned by `withPluginInstance()`.
 *
 * Stores an existing managed plugin instance under an internal symbol key.
 * When included in plugin configuration, this metadata allows the
 * instance to be reused without requiring native creation options.
 *
 * @typeParam TInstance - The type of the managed plugin instance.
 */
export interface PluginInstanceInput<TInstance = unknown> {
  [PLUGIN_META_KEY]: {
    instance: TInstance;
  };
}

/**
 * Configuration controls for reusing an existing managed plugin instance.
 *
 * Requires shared-instance metadata, allowing native creation options
 * to be omitted in `PluginOptionsInput`.
 *
 * An optional capture callback can also expose the reused instance.
 *
 * Used with `Partial` in `PluginOverride` so that instance reuse
 * remains optional in per-mount overrides.
 *
 * @typeParam TInstance - The type of the managed plugin instance.
 */
export type PluginInstanceOptions<TInstance> = ExposeOption<TInstance> &
  PluginInstanceInput<TInstance>;

/**
 * Internal instance controls passed to managed plugin factories
 * after plugin configuration resolution.
 *
 * Supports capturing the resulting instance and reusing an existing
 * instance instead of creating a new one.
 *
 * @typeParam TInstance - The type of the managed plugin instance.
 */
interface PluginInstanceControls<TInstance> extends ExposeOption<TInstance> {
  /** Existing plugin instance to reuse, if provided. */
  [SHARED_PLUGIN_INSTANCE_KEY]?: TInstance;
}

/**
 * Options passed to a managed plugin's creation function.
 *
 * Combines native plugin options with internal TestForge controls
 * for instance capture and reuse.
 *
 * Shared-instance metadata has already been resolved into runtime
 * controls by the plugin pipeline.
 *
 * @typeParam TInstance - The type of the managed plugin instance.
 * @typeParam TOptions - The native options accepted by the plugin factory.
 */
export type RuntimePluginOptions<TInstance, TOptions = object> = TOptions &
  PluginInstanceControls<TInstance>;

// =============================================================================
// 3. Deferred plugin instance references
// =============================================================================

/** Internal discriminator identifying deferred plugin instance references. */
export const PLUGIN_INSTANCE_REFERENCE_TYPE = "plugin-instance-reference" as const;

/** String literal type of the deferred instance reference discriminator. */
export type PluginInstanceReferenceType = typeof PLUGIN_INSTANCE_REFERENCE_TYPE;

/**
 * Deferred configuration value resolved from a managed plugin instance.
 *
 * Identifies the source plugin and provides a resolver that derives
 * the configuration value after the source instance becomes available.
 *
 * Created by `fromPluginInstance()`.
 *
 * @typeParam TPluginName - The name of the registered managed plugin
 * whose instance is referenced.
 * @typeParam TResult - The type of the resolved configuration value.
 */
export interface PluginInstanceReference<TPluginName extends PluginInstanceName, TResult> {
  /** Internal discriminator identifying a deferred instance reference. */
  readonly __type: PluginInstanceReferenceType;

  /** Name of the managed plugin providing the referenced instance. */
  readonly pluginName: TPluginName;

  /** Derives a configuration value from the referenced plugin instance. */
  readonly resolve: (instance: PluginInstanceMap[TPluginName]) => TResult;
}

/**
 * Union of deferred references to any registered managed plugin instance.
 *
 * Preserves the relationship between each plugin name and its
 * corresponding instance type in `PluginInstanceMap`.
 *
 * @typeParam TResult - The type of the value produced by the resolver.
 */
type AnyPluginInstanceReference<TResult> = {
  [K in PluginInstanceName]: PluginInstanceReference<K, TResult>;
}[PluginInstanceName];

/**
 * Configuration value that may be provided directly or through
 * a deferred managed plugin instance reference.
 *
 * Supports deferred references in nested object properties.
 * Function values are preserved without recursive transformation.
 *
 * @typeParam T - The expected value type after reference resolution.
 */
export type ResolvablePluginValue<T> =
  | T
  | AnyPluginInstanceReference<T>
  | (T extends (...args: never[]) => unknown
      ? never
      : T extends object
        ? { [K in keyof T]: ResolvablePluginValue<T[K]> }
        : never);

/**
 * Plugin options that support deferred managed plugin instance references.
 *
 * Allows individual option values, including nested properties, to be
 * resolved from managed plugin instances while preserving the outer
 * configuration shape.
 *
 * Unlike `ResolvablePluginValue`, does not allow replacing the entire
 * options object with a deferred reference.
 *
 * @typeParam T - The native plugin options type.
 */
export type ResolvablePluginOptions<T> = T extends object
  ? { [K in keyof T]: ResolvablePluginValue<T[K]> }
  : T;

// =============================================================================
// 4. Public plugin configuration
// =============================================================================

/**
 * Configuration for a plugin without managed instance support.
 *
 * Preserves native plugin option requirements while allowing deferred
 * instance references in option values, including nested properties.
 *
 * Disallows instance capture and reuse through TestForge instance controls.
 *
 * @typeParam TOptions - The native plugin options type.
 */
type PluginOptionsWithoutInstance<TOptions> = ResolvablePluginOptions<TOptions> & {
  [PLUGIN_EXPOSE]?: never;
  [PLUGIN_META_KEY]?: never;
};

/**
 * Configuration for plugins registered in `PluginOptionsMap`.
 *
 * Supports native plugin options and deferred instance references
 * in configuration values.
 *
 * Plugins registered in `PluginInstanceMap` also support instance
 * capture and reuse. Native creation options are required when creating
 * a new instance but may be omitted when an existing instance is supplied.
 *
 * Install-based plugins do not support instance capture or reuse.
 * Setting a plugin to `false` disables it.
 *
 * @example
 * ```typescript
 * import type { PluginOptionsInput } from "@testforgejs/vue-test-core";
 * import type {} from "@testforgejs/vue-test-plugin-router";
 * import { createMemoryHistory } from "vue-router";
 *
 * const plugins: PluginOptionsInput = {
 *   router: {
 *     history: createMemoryHistory(),
 *     routes: [],
 *   },
 * };
 * ```
 */
export type PluginOptionsInput = {
  [K in keyof PluginOptionsMap]?:
    | (K extends keyof PluginInstanceMap
        ? | (ResolvablePluginOptions<PluginOptionsMap[K]> & ExposeOption<PluginInstanceMap[K]>)
          | (ResolvablePluginOptions<Partial<PluginOptionsMap[K]>> &
              PluginInstanceOptions<PluginInstanceMap[K]>)
        : PluginOptionsWithoutInstance<PluginOptionsMap[K]>)
    | false;
};

/**
 * Per-mount configuration override for a plugin with managed instance support.
 *
 * Supports partial native options for record-like configurations, including
 * deferred instance references in option values.
 *
 * Optionally allows capturing the resulting instance or reusing an existing
 * instance. Setting the override to `false` disables the plugin for the mount.
 *
 * @typeParam TOptions - The native plugin options type.
 * @typeParam TInstance - The type of the managed plugin instance.
 */
export type PluginOverride<TOptions = unknown, TInstance = unknown> =
  | ((TOptions extends Record<string, any>
      ? ResolvablePluginOptions<Partial<TOptions>>
      : ResolvablePluginOptions<TOptions>) &
      Partial<PluginInstanceOptions<TInstance>>)
  | false;

/**
 * Per-mount configuration override for a plugin without managed instance support.
 *
 * Supports partial native options for record-like configurations, including
 * deferred instance references in option values.
 *
 * Disallows instance capture and reuse through TestForge instance controls.
 *
 * @typeParam TOptions - The native plugin options type.
 */
type PluginOverrideWithoutInstance<TOptions> = (TOptions extends Record<string, any>
  ? ResolvablePluginOptions<Partial<TOptions>>
  : ResolvablePluginOptions<TOptions>) & {
  [PLUGIN_EXPOSE]?: never;
  [PLUGIN_META_KEY]?: never;
};

/**
 * Per-mount plugin configuration overrides for registered plugins.
 *
 * Used in `extraOptions.plugins` to override individual plugin options
 * without requiring complete native creation configuration.
 *
 * Supports deferred instance references in override values.
 * Instance capture and reuse are available only for plugins registered
 * in `PluginInstanceMap`.
 *
 * Setting a plugin to `false` disables it for the current mount.
 *
 * @example
 * ```typescript
 * import type { PluginOverridesInput } from "@testforgejs/vue-test-core";
 * import type {} from "@testforgejs/vue-test-plugin-router";
 *
 * const overrides: PluginOverridesInput = {
 *   router: {
 *     routes: [],
 *   },
 * };
 * ```
 */
export type PluginOverridesInput = {
  [K in keyof PluginOptionsMap]?:
    | (K extends keyof PluginInstanceMap
        ? PluginOverride<PluginOptionsMap[K], PluginInstanceMap[K]>
        : PluginOverrideWithoutInstance<PluginOptionsMap[K]>)
    | false;
};

// =============================================================================
// 5. Presets
// =============================================================================

/**
 * Maps plugin names to factories providing preset-level default options.
 *
 * Each key must match the name of a plugin declared in the containing
 * preset's manifest.
 *
 * Factories are invoked when plugin defaults are resolved and should
 * return fresh mutable configuration data to avoid shared state.
 *
 * The map may be empty or omit defaults for individual manifest plugins.
 */
export type PluginConfigDefaults = Record<PluginName, PluginOptionsFactory<RuntimePluginConfig>>;

/**
 * Defines a preset of TestForge-managed plugins and their default configuration.
 *
 * The manifest declares which plugins are available and whether they are
 * enabled by default. The `defaults` map provides optional per-plugin
 * configuration factories.
 *
 * Default configuration keys must correspond to plugin names declared
 * in the manifest.
 */
export interface PresetDefinition {
  /**
   * Plugins available in this preset and their initial enabled state.
   *
   * Each entry associates a plugin module with its enabled flag.
   * Plugin names within the manifest must be unique.
   */
  manifest: PluginManifestEntry<any, any>[];

  /**
   * Default configuration factories keyed by plugin name.
   *
   * Each key must match the name of a plugin declared in `manifest`.
   * Individual manifest plugins may omit default configuration.
   *
   * This property is required but may be an empty object.
   */
  defaults: PluginConfigDefaults;
}

/**
 * Collection of named presets registered with a TestForge framework.
 *
 * Each key identifies a preset that can be selected through `presetKey`.
 * When present, the `"default"` preset is used if neither the factory
 * nor the current mount explicitly selects another preset.
 *
 * Each entry defines a complete preset rather than an extension
 * of another registered preset.
 */
export type TestFrameworkPresets = Record<string, PresetDefinition>;

/**
 * Key used to select a preset registered with a TestForge framework.
 *
 * Represents a string identifier rather than keys inferred from a
 * specific preset collection.
 *
 * The selected preset must exist in the framework's registered presets.
 * This requirement is validated at runtime.
 */
export type PresetKey = keyof TestFrameworkPresets;

/**
 * Defines changes applied when extending an existing preset.
 *
 * Used by `extendPreset()` to create a new preset from a base definition.
 * An extension can add or update manifest entries and replace
 * default-options factories for individual plugins.
 *
 * Both properties are optional. Omitted properties preserve
 * the corresponding configuration from the base preset.
 */
export interface PresetExtension {
  /**
   * Plugin manifest entries to add or update by plugin name.
   *
   * Existing entries retain their modules and may have their enabled
   * state changed. Entries for new plugins are added to the manifest.
   */
  manifest?: PluginManifestEntry<any, any>[];

  /**
   * Default-options factories to add or replace by plugin name.
   *
   * Each key must correspond to a plugin in the resulting manifest.
   * An existing factory is replaced entirely; its returned options
   * are not automatically merged with the replacement.
   */
  defaults?: PluginConfigDefaults;
}

// =============================================================================
// 6. Component factory API
// =============================================================================

/**
 * Partial component props inferred from the Vue component type.
 *
 * Preserves the component's prop names and value types while allowing
 * individual configuration sources to provide only a subset of props.
 *
 * @typeParam T - The Vue component type from which props are inferred.
 */
export type ComponentPropsInput<T extends Component> = Partial<ComponentProps<T>>;

type RelaxedSlot<T> = T extends (props: infer P) => unknown ? (props: P) => unknown : () => unknown;

/**
 * Partial component slots inferred from the Vue component type.
 *
 * Preserves declared slot names and inferred slot prop types while
 * relaxing the return types of slot functions.
 *
 * @typeParam T - The Vue component type from which slots are inferred.
 */
export type ComponentSlotsInput<T extends Component> = Partial<{
  [K in keyof ComponentSlots<T>]: RelaxedSlot<ComponentSlots<T>[K]>;
}>;

/**
 * Component data type inferred from its `data()` method.
 *
 * Follows the data inference used by Vue Test Utils.
 * Falls back to `Record<string, never>` when a compatible
 * data object type cannot be inferred.
 *
 * @typeParam T - The Vue component type from which data is inferred.
 */
export type ComponentData<T extends Component> = T extends { data?(...args: any): infer D }
  ? D extends Record<string, any>
    ? D
    : Record<string, never>
  : Record<string, never>;

/**
 * Partial component data inferred from the Vue component type.
 *
 * Allows mounting configuration to provide a subset of the component's
 * inferred data properties.
 *
 * @typeParam T - The Vue component type from which data is inferred.
 */
export type ComponentDataInput<T extends Component> = Partial<ComponentData<T>>;

/**
 * Resolves default component props for each mount.
 *
 * The resolver is invoked once per mount and should return fresh
 * mutable data to prevent shared state between component mounts.
 *
 * @typeParam T - The Vue component type used to infer default props.
 */
export type DefaultPropsResolver<T extends Component> = () => ComponentPropsInput<T>;

/**
 * Resolves default mounting options for each mount.
 *
 * The resolver is invoked once per mount and should return fresh
 * mutable configuration data to prevent shared state between mounts.
 *
 * Supports Vue Test Utils mounting options and TestForge-managed
 * plugin configuration.
 *
 * @typeParam T - The Vue component type used to infer props, slots,
 * and component data within the mounting options.
 */
export type DefaultMountOptionsResolver<T extends Component> = () => ComponentFactoryOptions<
  ComponentPropsInput<T>,
  ComponentSlotsInput<T>,
  ComponentDataInput<T>
>;

/**
 * Resolves default component slots for each mount.
 *
 * The resolver is invoked once per mount and should return fresh
 * mutable data to prevent shared state between component mounts.
 *
 * @typeParam T - The Vue component type used to infer default slots.
 */
export type DefaultSlotsResolver<T extends Component> = () => ComponentSlotsInput<T>;

/**
 * Factory-level configuration shared by both component factory creation APIs.
 *
 * Defines the default preset selection for component mounts.
 * Individual mounts can override this selection through
 * `ComponentFactoryExtraOptions.presetKey`.
 */
export interface ComponentFactoryConfig {
  /**
   * Preset key used by default when mounting components through this factory.
   *
   * A mount-level `presetKey` takes precedence over this value.
   * When omitted, the framework's normal preset resolution applies.
   */
  presetKey?: PresetKey;
}

/**
 * Named configuration returned by a component factory options resolver.
 *
 * Defines the component, its default props, mounting options, slots,
 * and optional factory-level preset selection.
 *
 * The configuration is resolved for each mount. Mutable default values
 * should be recreated by the resolver to prevent state leakage between
 * component mounts.
 *
 * The component determines the types of default props, slots, and data.
 * `NoInfer` prevents default configuration values from influencing
 * component type inference.
 *
 * @typeParam T - The Vue component type used to validate default
 * props, slots, and mounting options.
 */
export interface ComponentFactoryCreationOptions<
  T extends Component,
> extends ComponentFactoryConfig {
  /**
   * Vue component to mount.
   *
   * Determines the component-specific types of the default configuration.
   */
  component: T;

  /** Default props applied to each mount. */
  defaultProps?: ComponentPropsInput<NoInfer<T>>;

  /**
   * Default Vue Test Utils mounting options, including TestForge
   * managed plugin configuration.
   */
  defaultMountOptions?: ComponentFactoryOptions<
    ComponentPropsInput<NoInfer<T>>,
    ComponentSlotsInput<NoInfer<T>>,
    ComponentDataInput<NoInfer<T>>
  >;

  /** Default component slots applied to each mount. */
  defaultSlots?: ComponentSlotsInput<NoInfer<T>>;
}

/**
 * Reports unexpected keys using descriptive diagnostic property names.
 * Empty expected shapes retain the existing permissive behavior for
 * components without declared props or slots.
 */
type UnknownKeys<Actual, Expected, Context extends string> = [keyof Expected] extends [never]
  ? unknown
  : [Exclude<keyof Actual, keyof Expected>] extends [never]
    ? unknown
    : {
        [
          K in Exclude<keyof Actual, keyof Expected> as K extends string
            ? `Unknown ${Context} key: ${K}`
            : K
        ]: true;
      };

/**
 * Checks factory configuration keys without replacing invalid values with `never`.
 * Only TestForge-owned configuration layers are checked for extra keys.
 */
type StrictFactoryCreationOptions<
  T extends Component,
  Resolved extends ComponentFactoryCreationOptions<T>,
> = ComponentFactoryCreationOptions<T> &
  UnknownKeys<Resolved, ComponentFactoryCreationOptions<T>, "factory option"> &
  (Resolved extends { defaultProps: infer Props }
    ? { defaultProps: UnknownKeys<Props, ComponentPropsInput<T>, "default prop"> }
    : unknown) &
  (Resolved extends { defaultSlots: infer Slots }
    ? { defaultSlots: UnknownKeys<Slots, ComponentSlotsInput<T>, "default slot"> }
    : unknown) &
  (Resolved extends { defaultMountOptions: infer Options }
    ? {
        defaultMountOptions: UnknownKeys<
          Options,
          NonNullable<ComponentFactoryCreationOptions<T>["defaultMountOptions"]>,
          "default mount option"
        > &
          (Options extends { props: infer Props }
            ? { props: UnknownKeys<Props, ComponentPropsInput<T>, "default mount prop"> }
            : unknown) &
          (Options extends { slots: infer Slots }
            ? { slots: UnknownKeys<Slots, ComponentSlotsInput<T>, "default mount slot"> }
            : unknown);
      }
    : unknown);

/**
 * Resolves component factory configuration for each mount.
 *
 * The resolver is invoked once per mount and returns the component,
 * its default configuration, and optional factory-level settings.
 *
 * Mutable default values should be recreated for each invocation
 * to prevent shared state between component mounts.
 *
 * The inferred configuration shape is preserved to enable additional
 * type checking of TestForge-owned configuration keys.
 *
 * @typeParam T - The Vue component type used to validate component-specific
 * props, slots, and mounting options.
 * @typeParam Resolved - The inferred configuration shape returned by the
 * resolver, used to detect unexpected keys in TestForge-owned options.
 */
export type FactoryOptionsResolver<
  T extends Component,
  Resolved extends ComponentFactoryCreationOptions<T> = ComponentFactoryCreationOptions<T>,
> = () => Resolved & { component: T } & StrictFactoryCreationOptions<T, Resolved>;

/**
 * Vue Test Utils mounting options extended with TestForge-specific controls.
 *
 * Preserves standard Vue Test Utils options while providing component-aware
 * types for props, slots, and data, along with managed plugin configuration.
 *
 * Used for both factory-level `defaultMountOptions` and per-mount
 * `mountOptions`.
 *
 * @typeParam Props - The component props type used to validate `props`.
 * @typeParam Slots - The component slots type used to validate `slots`.
 * @typeParam Data - The component data type used to validate `data`.
 */
export interface ComponentFactoryOptions<Props = any, Slots = any, Data = any> extends Omit<
  MountingOptions<Props, Data>,
  "props" | "slots" | "data"
> {
  /**
   * Vue Test Utils data override factory, typed by `Data`.
   */
  data?: () => Data;

  /**
   * Component props supplied through mounting options, typed by `Props`.
   */
  props?: Props;

  /**
   * Component slots supplied through mounting options, typed by `Slots`.
   */
  slots?: Slots;

  /**
   * Configuration for TestForge-managed plugins declared in the active preset.
   *
   * When supplied through per-mount `mountOptions`, a plugin's configuration
   * replaces its factory-level `defaultMountOptions.plugins` configuration.
   * Use `extraOptions.plugins` for partial per-mount overrides instead.
   *
   * Set a plugin entry to `false` to disable that plugin.
   * Ordinary Vue plugins belong in Vue Test Utils `global.plugins`.
   */
  plugins?: PluginOptionsInput;

  /**
   * Whether to skip TestForge-managed plugin setup for this mount.
   *
   * Does not disable ordinary Vue plugins registered through
   * Vue Test Utils `global.plugins`.
   *
   * Defaults to `false`.
   */
  skipManagedPlugins?: boolean;
}

/** Alias for mounting options that include TestForge plugin configuration. */
export type MountWithPluginsOptions<Props = any, Slots = any, Data = any> = ComponentFactoryOptions<
  Props,
  Slots,
  Data
>;

/**
 * Per-mount controls for preset selection, factory defaults, and managed plugins.
 *
 * Passed as the fourth argument to `factory()` or as `extraOptions`
 * in `factory.withOptions()`.
 *
 * These options apply only to the current mount and do not modify
 * the component factory's default configuration.
 */
export type ComponentFactoryExtraOptions = {
  /**
   * Preset key to use for this mount.
   *
   * Overrides the factory-level `presetKey`. When omitted, the factory's
   * preset selection or the framework's default resolution applies.
   */
  presetKey?: PresetKey;

  /**
   * Whether to skip the factory's `defaultProps`.
   *
   * Does not exclude props supplied through `defaultMountOptions.props`
   * or the current mount's arguments.
   *
   * Defaults to `false`.
   */
  skipDefaultProps?: boolean;

  /**
   * Whether to skip the factory's `defaultSlots`.
   *
   * Does not exclude slots supplied through `defaultMountOptions.slots`
   * or the current mount's arguments.
   *
   * Defaults to `false`.
   */
  skipDefaultSlots?: boolean;

  /**
   * Whether to skip the factory's `defaultMountOptions`.
   *
   * Does not exclude `defaultProps`, `defaultSlots`, or the active
   * preset's default plugin configuration.
   *
   * Defaults to `false`.
   */
  skipDefaultOptions?: boolean;

  /**
   * Per-mount overrides for managed plugin configuration.
   *
   * Applies a shallow overlay to the resolved runtime options of each
   * specified plugin. Set a plugin entry to `false` to disable it.
   *
   * Unlike `mountOptions.plugins`, which replaces the factory-level
   * configuration for a plugin, these overrides preserve unspecified
   * top-level options.
   */
  plugins?: PluginOverridesInput;
};

/**
 * Named arguments for mounting a component through `factory.withOptions()`.
 *
 * Each property corresponds to a positional argument of `factory()`.
 * Both invocation forms use equivalent configuration resolution
 * and mounting behavior.
 *
 * All properties are optional. Omitted properties behave as omitted
 * positional arguments, preserving applicable factory-level defaults.
 *
 * @typeParam T - The Vue component type used to infer props, slots,
 * and component data.
 *
 * @example
 * ```typescript
 * const wrapper = factory.withOptions({
 *   props: { title: "Hello" },
 *   mountOptions: { shallow: false },
 * });
 * ```
 */
export interface ComponentFactoryInvocationOptions<T extends Component> {
  /** Component props supplied for this mount. */
  props?: ComponentPropsInput<T>;

  /** Vue Test Utils mounting options, including TestForge managed plugin configuration. */
  mountOptions?: ComponentFactoryOptions<
    ComponentPropsInput<T>,
    ComponentSlotsInput<T>,
    ComponentDataInput<T>
  >;

  /** Component slots supplied for this mount. */
  slots?: ComponentSlotsInput<T>;

  /** Per-mount preset selection, default-skipping controls, and plugin overrides. */
  extraOptions?: ComponentFactoryExtraOptions;
}

/**
 * Reusable factory for mounting a Vue component through TestForge.
 *
 * Resolves factory-level defaults for each mount and supports both
 * positional and object-based mounting APIs.
 *
 * Both invocation forms use equivalent configuration and mounting
 * behavior and return the same Vue Test Utils wrapper type.
 *
 * @typeParam T - The Vue component type used to infer props, slots,
 * and mounting options.
 */
export interface ComponentFactory<T extends Component> {
  /**
   * Mounts the component using positional arguments.
   *
   * Combines the supplied configuration with factory-level defaults
   * and applies per-mount controls through `extraOptions`.
   *
   * @param props - Component props supplied for this mount.
   * @param mountOptions - Vue Test Utils mounting options, including
   * TestForge managed plugin configuration.
   * @param slots - Component slots supplied for this mount.
   * @param extraOptions - Per-mount preset selection, default-skipping
   * controls, and plugin overrides.
   *
   * @returns A Vue Test Utils wrapper for the mounted component.
   *
   * @example
   * ```typescript
   * const wrapper = factory(
   *   { title: "Hello" },
   *   { shallow: false },
   * );
   * ```
   */
  (
    props?: ComponentPropsInput<T>,
    mountOptions?: ComponentFactoryOptions<
      ComponentPropsInput<T>,
      ComponentSlotsInput<T>,
      ComponentDataInput<T>
    >,
    slots?: ComponentSlotsInput<T>,
    extraOptions?: ComponentFactoryExtraOptions,
  ): ReturnType<typeof mount<T>>;

  /**
   * Mounts the component using named arguments.
   *
   * An alternative to calling `factory(props, mountOptions, slots, extraOptions)`.
   * Both forms use the same configuration resolution and mounting behavior.
   *
   * @param options - Named arguments for this mount.
   *
   * @returns A Vue Test Utils wrapper for the mounted component.
   *
   * @example
   * ```typescript
   * const wrapper = factory.withOptions({
   *   props: { title: "Hello" },
   *   mountOptions: { shallow: false },
   * });
   * ```
   */
  withOptions(options: ComponentFactoryInvocationOptions<T>): ReturnType<typeof mount<T>>;
}

/**
 * Creates reusable component test factories.
 *
 * Supports positional factory creation with individual default resolvers
 * and object-based creation through a single configuration resolver.
 *
 * Both APIs produce a `ComponentFactory` and resolve fresh default
 * configuration for each mount.
 */
export interface ComponentFactoryCreator {
  /**
   * Creates a component factory using positional arguments.
   *
   * The component and factory-level configuration remain fixed, while
   * the supplied default resolvers are invoked once per mount.
   *
   * Default resolvers should return fresh mutable data to prevent
   * state leakage between component mounts.
   *
   * @typeParam T - The Vue component type, inferred from `component`.
   *
   * @param component - The Vue component to mount.
   * @param defaultProps - Optional resolver for default component props.
   * @param defaultMountOptions - Optional resolver for default mounting options.
   * @param defaultSlots - Optional resolver for default component slots.
   * @param config - Optional factory-level configuration, including `presetKey`.
   *
   * @returns A reusable component test factory.
   *
   * @example
   * ```typescript
   * const factory = testComponentFactory(
   *   MyComponent,
   *   () => ({ title: "Hello" }),
   *   () => ({ shallow: false }),
   * );
   *
   * const wrapper = factory();
   * ```
   */
  <T extends Component>(
    component: T,
    defaultProps?: DefaultPropsResolver<NoInfer<T>>,
    defaultMountOptions?: DefaultMountOptionsResolver<NoInfer<T>>,
    defaultSlots?: DefaultSlotsResolver<NoInfer<T>>,
    config?: ComponentFactoryConfig,
  ): ComponentFactory<T>;

  /**
   * Creates a component factory using a named configuration resolver.
   *
   * The resolver is invoked once per mount and returns the component,
   * optional default configuration, and factory-level settings.
   *
   * The resolver should return fresh mutable configuration data to
   * prevent state leakage between component mounts.
   *
   * @typeParam T - The Vue component type, inferred from the resolver.
   * @typeParam Resolved - The inferred configuration shape, used to
   * validate TestForge-owned configuration keys.
   *
   * @param resolveOptions - Resolver returning the component factory configuration.
   *
   * @returns A reusable component test factory.
   *
   * @example
   * ```typescript
   * const factory = testComponentFactory.withOptions(() => ({
   *   component: MyComponent,
   *   defaultProps: { title: "Hello" },
   *   defaultMountOptions: { shallow: false },
   * }));
   *
   * const wrapper = factory();
   * ```
   */
  withOptions<T extends Component, Resolved extends ComponentFactoryCreationOptions<T>>(
    resolveOptions: FactoryOptionsResolver<T, Resolved>,
  ): ComponentFactory<T>;
}

/**
 * A TestForge framework instance created by `createTestFramework()`.
 *
 * Provides a component factory creator configured with the framework's
 * presets and default mounting behavior.
 */
export interface TestFramework {
  /**
   * Creates reusable component factories using positional arguments
   * or a configuration resolver through `.withOptions()`.
   */
  testComponentFactory: ComponentFactoryCreator;
}

interface CommonCreateTestFrameworkOptions {
  /**
   * Whether to shallow-mount components by default.
   *
   * Defaults to `false`. Individual mounts can override this setting
   * through the Vue Test Utils `shallow` option.
   */
  shallowByDefault?: boolean;
}

interface SinglePresetOptions extends CommonCreateTestFrameworkOptions {
  /** Preset used as the framework's default preset. */
  preset: PresetDefinition;

  presets?: never;
}

interface MultiplePresetsOptions extends CommonCreateTestFrameworkOptions {
  preset?: never;

  /** Named presets available for selection during component mounting. */
  presets?: TestFrameworkPresets;
}

/**
 * Configuration options for `createTestFramework()`.
 *
 * Supports a single preset through `preset` or a collection of named
 * presets through `presets`. These options are mutually exclusive.
 *
 * Both options may be omitted to create a framework without presets.
 *
 * `shallowByDefault` is available in both configurations and defaults
 * to `false`.
 *
 * @example
 * ```typescript
 * import type { CreateTestFrameworkOptions } from "@testforgejs/vue-test-core";
 *
 * // A single preset.
 * const single: CreateTestFrameworkOptions = {
 *   preset: basePreset,
 * };
 *
 * // A collection of named presets.
 * const multiple: CreateTestFrameworkOptions = {
 *   presets: {
 *     default: basePreset,
 *     admin: adminPreset,
 *   },
 * };
 *
 * // No presets.
 * const empty: CreateTestFrameworkOptions = {};
 * ```
 */
export type CreateTestFrameworkOptions = SinglePresetOptions | MultiplePresetsOptions;

// =============================================================================
// 7. Runtime configuration and mount pipeline
// =============================================================================

/** Middleware runtime state without component-specific generics. */
export type RuntimePluginConfig = Record<PropertyKey, any>;

export type RuntimePluginOption = RuntimePluginConfig | false;

export type ResolvedPluginOptions = Record<PluginName, RuntimePluginOption>;

export type ResolvedPluginDefaults = Record<PluginName, RuntimePluginConfig>;

/** Runtime configuration shape that includes optional input instance metadata. */
export type ResolvedPluginConfig = RuntimePluginConfig & PluginMetaOptions;

/** Plugin configuration overlay, or false to disable the plugin. */
export type PluginOverlay = ResolvedPluginConfig | false;

/** Runtime plugin configuration with an optional shared managed instance. */
export type RuntimePluginState = RuntimePluginConfig & {
  [SHARED_PLUGIN_INSTANCE_KEY]?: unknown;
};

/** Extra options after plugin overrides have been resolved. */
export type RuntimeExtraOptions = Omit<ComponentFactoryExtraOptions, "plugins"> & {
  plugins?: ResolvedPluginOptions;
};

/** Identifies which configuration source is being validated. */
export type OptionsContext = "defaultMountOptions" | "mountOptions" | "extraOptions";

/** Configuration sources used to initialize a mount pipeline context. */
export interface CreatePipelineContextParams {
  defaultMountOptions?: ComponentFactoryOptions;
  mountOptions?: ComponentFactoryOptions;
  extraOptions?: ComponentFactoryExtraOptions;
  presets?: TestFrameworkPresets;
}

/** Input configuration, active preset, and accumulated mount pipeline state. */
export interface PipelineContext {
  defaultMountOptions: ComponentFactoryOptions;
  mountOptions: ComponentFactoryOptions;
  extraOptions: ComponentFactoryExtraOptions;
  supportedPlugins: SupportedPluginsMap;
  preset: PresetDefinition | undefined;
  result: PipelineContextResult;
}

declare const RuntimeContextBrand: unique symbol;

/**
 * Pipeline context marked as a runtime context by the pipeline.
 * The brand distinguishes this stage at the type level; it does not validate data.
 */
export interface RuntimeContext extends PipelineContext {
  readonly [RuntimeContextBrand]: true;
}

declare const MountReadyBrand: unique symbol;

/**
 * Runtime context marked as ready for mounting, with runtime plugin overrides.
 * The brand records the pipeline stage rather than performing validation.
 */
export interface MountReadyContext extends RuntimeContext {
  extraOptions: RuntimeExtraOptions;

  readonly [MountReadyBrand]: true;
}

/** VTU mount state without a component-specific Props/Data type. */
type MountOptionsState = Partial<MountingOptions<any, any>>;

/** Mount options and plugin state accumulated by pipeline middleware. */
export interface PipelineContextResult {
  mountOptions: MountOptionsState;
  global: NonNullable<MountingOptions<any, any>["global"]>;
  pluginDefaultsState: ResolvedPluginDefaults;
  plugins: ResolvedPluginOptions;
}

/** Partial updates to individual sections of the accumulated pipeline result. */
export type PipelineResultPatch = {
  mountOptions?: Partial<PipelineContextResult["mountOptions"]>;
  plugins?: Partial<PipelineContextResult["plugins"]>;
  pluginDefaultsState?: Partial<PipelineContextResult["pluginDefaultsState"]>;
  global?: Partial<PipelineContextResult["global"]>;
};

/** Synchronous context transformation between two pipeline stages. */
export type PipelineMiddleware<
  In extends PipelineContext = PipelineContext,
  Out extends PipelineContext = In,
> = (ctx: In) => Out;

/** Executable pipeline with explicit input and output types. */
export interface Pipeline<In = PipelineContext, Out = In> {
  run: (ctx: In) => Out;
}

/**
 * Infers the last middleware return type from a non-empty tuple.
 * Falls back to In when no last middleware can be inferred.
 * Does not check compatibility between consecutive middleware functions.
 */
export type PipeResult<In, Ms extends readonly any[]> = Ms extends readonly [
  ...any[],
  infer Last extends (...args: any[]) => any,
]
  ? ReturnType<Last>
  : In;

/** Framework-level runtime defaults used when mounting a component. */
export interface MountRuntimeOptions {
  shallowByDefault: boolean;
}

/** Component data sources and controls supplied to the data-merging helper. */
export interface MergeComponentDataParams<T extends object> {
  // Factory defaults.
  defaultMountData?: T | null;
  defaultData?: T | null;

  // Per-test data.
  mountData?: T | null;
  directData?: T | null;

  // Merge controls.
  skipDefault?: boolean;
  skipOptions?: boolean;
}

// =============================================================================
// 8. Shared utility types
// =============================================================================

/** String-keyed object shape; does not guarantee a plain object at runtime. */
export type PlainObject = Record<string, unknown>;

export type Mergeable = PlainObject | unknown[];
