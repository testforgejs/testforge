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

/** Plugin identifier, such as "pinia", "router", or "i18n". */
export type PluginName = string;

/** Value accepted by Vue Test Utils through `global.plugins`. */
export type MountPlugin = Plugin | [Plugin, ...unknown[]];

/** Creates an instance from plugin-specific options. */
export type PluginFactory<TInstance = unknown, TOptions = unknown> = (
  options: TOptions,
) => TInstance;

/** Produces plugin options when defaults are requested. */
export type PluginOptionsFactory<TOptions> = () => TOptions;

/**
 * Test-runner operations available to plugin default-option factories.
 * Mock and spy return types are intentionally runner-agnostic.
 */
export interface UniversalRunner {
  fn: <T extends (...args: any[]) => any>(implementation?: T) => any;

  spyOn: <T extends object, M extends keyof T>(
    object: T,
    method: M,
  ) => T[M] extends (...args: any[]) => any ? any : never;

  clearAllMocks: () => any;
  resetAllMocks: () => any;
  restoreAllMocks: () => any;
}

/**
 * Creates an options factory, optionally using the active test runner.
 * The returned factory produces options when invoked; this outer call
 * supplies the runner dependency rather than creating plugin options directly.
 */
export type PluginDefaultOptionsFactory<TOptions> = (
  runner?: UniversalRunner,
) => PluginOptionsFactory<TOptions>;

/** Plugin creation contract and optional lifecycle hooks. */
export interface PluginDefinition<TPlugin extends MountPlugin = MountPlugin, TOptions = unknown> {
  /** Transforms creation options before the plugin is created. */
  beforeCreate?: (ctx: PipelineContext, options: TOptions) => TOptions;
  /** Creates the plugin value installed through Vue Test Utils. */
  create: (options: TOptions) => TPlugin;
  /** Runs after creation with the created plugin and pipeline context. */
  afterCreate?: (plugin: TPlugin, ctx: PipelineContext) => void;
  /** Declares support for deferred plugin instance references. */
  supportsInstanceReferences?: true;
}

/** Named plugin module consumed by preset manifests and the registry. */
export interface PluginModule<TPlugin extends MountPlugin = MountPlugin, TOptions = unknown> {
  getName(): PluginName;
  getDefinition(): PluginDefinition<TPlugin, TOptions>;
  /** Supplies an options factory, optionally bound to a test runner. */
  getDefaultOptions?: PluginDefaultOptionsFactory<TOptions>;
}

/** Plugin module that guarantees an available default-options factory. */
export interface PluginModuleWithDefaults<
  TPlugin extends MountPlugin = MountPlugin,
  TOptions = unknown,
> extends PluginModule<TPlugin, TOptions> {
  getDefaultOptions: PluginDefaultOptionsFactory<TOptions>;
}

/** Associates a plugin module with its initial enabled state in a preset. */
export interface PluginManifestEntry<
  TPlugin extends MountPlugin = MountPlugin,
  TOptions = unknown,
> {
  module: PluginModule<TPlugin, TOptions>;
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

/** Extend through module augmentation to register public plugin options. */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface PluginOptionsMap {}

/**
 * Registry of managed instance types (extend through module augmentation).
 *
 * Registering a plugin enables typed `captureInstance()`,
 * `withPluginInstance()`, and `fromPluginInstance()` support.
 * Install-based plugins without managed instances are not registered here.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface PluginInstanceMap {}

/** String keys registered in the managed-instance type map. */
export type PluginInstanceName = Extract<keyof PluginInstanceMap, PluginName>;

// Instance capture through a symbol-keyed callback.

/**
 * Optional callback for exposing a managed plugin instance.
 */
export interface ExposeOption<TInstance> {
  [PLUGIN_EXPOSE]?: (instance: TInstance) => void;
}

/**
 * Handle returned by `captureInstance()`.
 */
export interface InstanceCapture<TInstance> {
  /** Captured instance, or undefined before an instance is exposed. */
  readonly instance: TInstance | undefined;

  [PLUGIN_EXPOSE](instance: TInstance): void;
}

// Instance metadata and reuse.

/** Metadata stored in an unresolved plugin configuration. */
export interface PluginMeta<TInstance = unknown> {
  instance?: TInstance;
}

/** Optional symbol-keyed metadata accepted before pipeline resolution. */
export interface PluginMetaOptions<TInstance = unknown> {
  [PLUGIN_META_KEY]?: PluginMeta<TInstance>;
}

/** Required instance metadata returned by `withPluginInstance()`. */
export interface PluginInstanceInput<TInstance = unknown> {
  [PLUGIN_META_KEY]: {
    instance: TInstance;
  };
}

/**
 * Public controls for reusing a pre-created managed plugin instance.
 *
 * Requires instance metadata, allowing native plugin creation options
 * to be omitted when used in PluginOptionsInput.
 *
 * For partial configuration overrides, wrap this type in Partial
 * so that providing an instance remains optional.
 */
export type PluginInstanceOptions<TInstance> = ExposeOption<TInstance> &
  PluginInstanceInput<TInstance>;

/** Controls passed to managed plugin factories after pipeline resolution. */
interface PluginInstanceControls<TInstance> extends ExposeOption<TInstance> {
  [SHARED_PLUGIN_INSTANCE_KEY]?: TInstance;
}

/** Runtime creation options; input metadata has already been resolved. */
export type RuntimePluginOptions<TInstance, TOptions = object> = TOptions &
  PluginInstanceControls<TInstance>;

// =============================================================================
// 3. Deferred plugin instance references
// =============================================================================

/** Discriminant used to identify deferred plugin instance references. */
export const PLUGIN_INSTANCE_REFERENCE_TYPE = "plugin-instance-reference" as const;

export type PluginInstanceReferenceType = typeof PLUGIN_INSTANCE_REFERENCE_TYPE;

/**
 * Deferred value derived from a named managed plugin instance.
 * The resolver receives that instance and produces the referenced value.
 */
export interface PluginInstanceReference<TPluginName extends PluginInstanceName, TResult> {
  readonly __type: PluginInstanceReferenceType;
  readonly pluginName: TPluginName;
  readonly resolve: (instance: PluginInstanceMap[TPluginName]) => TResult;
}

/** Union of references to any registered managed plugin instance. */
type AnyPluginInstanceReference<TResult> = {
  [K in PluginInstanceName]: PluginInstanceReference<K, TResult>;
}[PluginInstanceName];

/** Allows direct or deferred values, including nested object properties. */
export type ResolvablePluginValue<T> =
  | T
  | AnyPluginInstanceReference<T>
  | (T extends (...args: never[]) => unknown
      ? never
      : T extends object
        ? { [K in keyof T]: ResolvablePluginValue<T[K]> }
        : never);

/** Allows deferred references in fields, preserving the outer options shape. */
export type ResolvablePluginOptions<T> = T extends object
  ? { [K in keyof T]: ResolvablePluginValue<T[K]> }
  : T;

// =============================================================================
// 4. Public plugin configuration
// =============================================================================

/** Forbid instance metadata and capture controls on install-based plugins. */
type PluginOptionsWithoutInstance<TOptions> = ResolvablePluginOptions<TOptions> & {
  [PLUGIN_EXPOSE]?: never;
  [PLUGIN_META_KEY]?: never;
};

/**
 * Configuration for registered plugins.
 *
 * Instance capture and reuse require registration in `PluginInstanceMap`.
 * Native options may be omitted when a pre-created instance is supplied.
 * `false` disables the plugin.
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
 * Partial per-mount override for a plugin with managed instance support.
 * `false` disables that plugin for the mount.
 */
export type PluginOverride<TOptions = unknown, TInstance = unknown> =
  | ((TOptions extends Record<string, any>
      ? ResolvablePluginOptions<Partial<TOptions>>
      : ResolvablePluginOptions<TOptions>) &
      Partial<PluginInstanceOptions<TInstance>>)
  | false;

/** Partial override without instance capture or reuse. */
type PluginOverrideWithoutInstance<TOptions> = (TOptions extends Record<string, any>
  ? ResolvablePluginOptions<Partial<TOptions>>
  : ResolvablePluginOptions<TOptions>) & {
  [PLUGIN_EXPOSE]?: never;
  [PLUGIN_META_KEY]?: never;
};

/** Per-mount overrides; instance controls require `PluginInstanceMap` registration. */
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

/** Default configuration factories for plugins included in a preset. */
export type PluginConfigDefaults = Record<PluginName, PluginOptionsFactory<RuntimePluginConfig>>;

/** Plugin manifest and default-option factories defining a preset. */
export interface PresetDefinition {
  /** Plugins available in the preset and their enabled state. */
  manifest: PluginManifestEntry<any, any>[];

  /** Per-plugin default factories. May be empty or omit manifest plugins. */
  defaults: PluginConfigDefaults;
}

/** Named presets available to the framework. */
export type TestFrameworkPresets = Record<string, PresetDefinition>;

/** Preset lookup key; not restricted to keys of a specific preset collection. */
export type PresetKey = keyof TestFrameworkPresets;

/** Optional manifest and default-factory contributions for extending a preset. */
export interface PresetExtension {
  manifest?: PluginManifestEntry<any, any>[];
  defaults?: PluginConfigDefaults;
}

// =============================================================================
// 6. Component factory API
// =============================================================================

/** Each source contributes only part of the final component props. */
export type ComponentPropsInput<T extends Component> = Partial<ComponentProps<T>>;

type RelaxedSlot<T> = T extends (props: infer P) => unknown ? (props: P) => unknown : () => unknown;

/** Optional component slots with inferred slot props and relaxed return types. */
export type ComponentSlotsInput<T extends Component> = Partial<{
  [K in keyof ComponentSlots<T>]: RelaxedSlot<ComponentSlots<T>[K]>;
}>;

/** Matches the data inference used by Vue Test Utils. */
export type ComponentData<T extends Component> = T extends { data?(...args: any): infer D }
  ? D extends Record<string, any>
    ? D
    : Record<string, never>
  : Record<string, never>;

/** Partial component data contributed by a configuration source. */
export type ComponentDataInput<T extends Component> = Partial<ComponentData<T>>;

/** Resolves component-specific default props for each mount. */
export type DefaultPropsResolver<T extends Component> = () => ComponentPropsInput<T>;

/** Resolves component-specific default mounting options for each mount. */
export type DefaultMountOptionsResolver<T extends Component> = () => ComponentFactoryOptions<
  ComponentPropsInput<T>,
  ComponentSlotsInput<T>,
  ComponentDataInput<T>
>;

/** Resolves component-specific default slots for each mount. */
export type DefaultSlotsResolver<T extends Component> = () => ComponentSlotsInput<T>;

/** Factory-level controls shared by both creation forms. */
export interface ComponentFactoryConfig {
  /** Select the default preset for this component factory. */
  presetKey?: PresetKey;
}

/**
 * Named configuration returned by a component factory options resolver.
 *
 * The component determines the types of default props, slots, and data;
 * `NoInfer` prevents those defaults from changing component inference.
 */
export interface ComponentFactoryCreationOptions<
  T extends Component,
> extends ComponentFactoryConfig {
  /** Vue component for which the factory is created. */
  component: T;

  /** Default props applied to each mount. */
  defaultProps?: ComponentPropsInput<NoInfer<T>>;

  /** Default mounting options applied to each mount. */
  defaultMountOptions?: ComponentFactoryOptions<
    ComponentPropsInput<NoInfer<T>>,
    ComponentSlotsInput<NoInfer<T>>,
    ComponentDataInput<NoInfer<T>>
  >;

  /** Default slots applied to each mount. */
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
 * The resolver is invoked once per mount and should return fresh
 * mutable configuration data to prevent state leakage between tests.
 * `Resolved` captures the actual return shape so unexpected keys can be checked.
 */
export type FactoryOptionsResolver<
  T extends Component,
  Resolved extends ComponentFactoryCreationOptions<T> = ComponentFactoryCreationOptions<T>,
> = () => Resolved & { component: T } & StrictFactoryCreationOptions<T, Resolved>;

/** Vue Test Utils mounting options extended with TestForge plugin controls. */
export interface ComponentFactoryOptions<Props = any, Slots = any, Data = any> extends Omit<
  MountingOptions<Props, Data>,
  "props" | "slots" | "data"
> {
  /** Strictly typed component data. */
  data?: () => Data;

  /** Strictly typed component props. */
  props?: Props;

  /** Strictly typed component slots. */
  slots?: Slots;

  /** Managed plugin configuration. */
  plugins?: PluginOptionsInput;

  /** Disable plugins supplied by the active preset. */
  skipManagedPlugins?: boolean;
}

/** Alias for mounting options that include TestForge plugin configuration. */
export type MountWithPluginsOptions<Props = any, Slots = any, Data = any> = ComponentFactoryOptions<
  Props,
  Slots,
  Data
>;

/** Per-call preset selection, default-skipping controls, and plugin overrides. */
export type ComponentFactoryExtraOptions = {
  /** Select the preset used for this factory call. */
  presetKey?: PresetKey;

  /** Skip factory-level default props. */
  skipDefaultProps?: boolean;

  /** Skip factory-level default slots. */
  skipDefaultSlots?: boolean;

  /** Skip base mount options. */
  skipDefaultOptions?: boolean;

  /** Partial plugin overrides applied for this factory call. */
  plugins?: PluginOverridesInput;
};

/**
 * Named arguments for `factory.withOptions()`.
 *
 * Each field corresponds to a positional argument of `factory()`.
 * Omitting a field uses the same default as the positional API.
 */
export interface ComponentFactoryInvocationOptions<T extends Component> {
  /** Component props supplied for this mount. */
  props?: ComponentPropsInput<T>;

  /** Mount options for this invocation, including managed plugin configuration. */
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
 * Callable component factory returned by `testComponentFactory()`.
 * Both invocation forms return the same Vue Test Utils wrapper type.
 */
export interface ComponentFactory<T extends Component> {
  /** Mounts the component using positional arguments. */
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
   * Mounts the component using an options object.
   *
   * An alternative to calling `factory(props, mountOptions, slots, extraOptions)`.
   * Both forms use equivalent configuration and mounting behavior.
   *
   * @param options - Named arguments for this mount.
   * @returns A Vue Test Utils wrapper for the mounted component.
   *
   * @example
   * ```typescript
   * const wrapper = factory.withOptions({
   *   props: { title: "Hello" },
   *   extraOptions: { presetKey: "i18n" },
   * });
   * ```
   */
  withOptions(options: ComponentFactoryInvocationOptions<T>): ReturnType<typeof mount<T>>;
}

/** Creates reusable component factories using positional or named configuration resolvers. */
export interface ComponentFactoryCreator {
  /**
   * Creates a component factory using positional arguments.
   *
   * Default configuration factories are invoked for each mount.
   * Each factory should return fresh mutable data.
   */
  <T extends Component>(
    component: T,
    defaultProps?: DefaultPropsResolver<NoInfer<T>>,
    defaultMountOptions?: DefaultMountOptionsResolver<NoInfer<T>>,
    defaultSlots?: DefaultSlotsResolver<NoInfer<T>>,
    config?: ComponentFactoryConfig,
  ): ComponentFactory<T>;

  /**
   * Creates a reusable component factory from a configuration resolver.
   *
   * The resolver is invoked once before each mount, allowing every
   * invocation to receive independent default configuration data.
   *
   * The component and preset may remain stable across invocations,
   * while mutable configuration objects should be recreated.
   *
   * @param resolveOptions - Factory configuration resolver.
   * @returns A reusable component test factory.
   *
   * @example
   * ```typescript
   * const factory = testComponentFactory.withOptions(() => ({
   *   component: MyComponent,
   *   defaultProps: { title: "Hello" },
   *   presetKey: "i18n",
   * }));
   *
   * factory();
   * ```
   */
  withOptions<T extends Component, Resolved extends ComponentFactoryCreationOptions<T>>(
    resolveOptions: FactoryOptionsResolver<T, Resolved>,
  ): ComponentFactory<T>;
}

/** Public API returned by `createTestFramework()`. */
export interface TestFramework {
  /** Creates a reusable component mounting factory. */
  testComponentFactory: ComponentFactoryCreator;
}

interface CommonCreateTestFrameworkOptions {
  /** Default value of Vue Test Utils `shallow` (default: false). */
  shallowByDefault?: boolean;
}

interface SinglePresetOptions extends CommonCreateTestFrameworkOptions {
  preset: PresetDefinition;
  presets?: never;
}

interface MultiplePresetsOptions extends CommonCreateTestFrameworkOptions {
  preset?: never;
  presets?: TestFrameworkPresets;
}

/**
 * Framework configuration.
 *
 * Accepts either a single preset or a named preset collection.
 * `preset` and `presets` cannot be supplied together.
 * Both may be omitted to create a framework without presets.
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
