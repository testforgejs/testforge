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

export type PluginFactory<TInstance = unknown, TOptions = unknown> = (
  options: TOptions,
) => TInstance;

export type PluginOptionsFactory<TOptions> = () => TOptions;

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

export type PluginDefaultOptionsFactory<TOptions> = (
  runner?: UniversalRunner,
) => PluginOptionsFactory<TOptions>;

export interface PluginDefinition<TPlugin extends MountPlugin = MountPlugin, TOptions = unknown> {
  beforeCreate?: (ctx: PipelineContext, options: TOptions) => TOptions;
  create: (options: TOptions) => TPlugin;
  afterCreate?: (plugin: TPlugin, ctx: PipelineContext) => void;
  supportsInstanceReferences?: true;
}

export interface PluginModule<TPlugin extends MountPlugin = MountPlugin, TOptions = unknown> {
  getName(): PluginName;
  getDefinition(): PluginDefinition<TPlugin, TOptions>;
  getDefaultOptions?: PluginDefaultOptionsFactory<TOptions>;
}

export interface PluginModuleWithDefaults<
  TPlugin extends MountPlugin = MountPlugin,
  TOptions = unknown,
> extends PluginModule<TPlugin, TOptions> {
  getDefaultOptions: PluginDefaultOptionsFactory<TOptions>;
}

export interface PluginManifestEntry<
  TPlugin extends MountPlugin = MountPlugin,
  TOptions = unknown,
> {
  module: PluginModule<TPlugin, TOptions>;
  enabled: boolean;
}

export interface PluginRegistry {
  register(entry: PluginManifestEntry): void;
  get(name: PluginName): PluginDefinition<any, any> | undefined;
  has(name: PluginName): boolean;
  entries(): IterableIterator<[PluginName, PluginDefinition<any, any>]>;
  getNames(): PluginName[];
}

export type SupportedPluginState = boolean;

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

export type PluginInstanceName = Extract<keyof PluginInstanceMap, PluginName>;

/** Symbol-keyed callback used to capture a managed instance. */

/**
 * Optional callback for exposing a managed plugin instance.
 */
export interface ExposeOption<TInstance> {
  [PLUGIN_EXPOSE]?: (instance: TInstance) => void;
}

/**
 * Handle returned by captureInstance().
 */
export interface InstanceCapture<TInstance> {
  readonly instance: TInstance | undefined;

  [PLUGIN_EXPOSE](instance: TInstance): void;
}

/**
 * Metadata stored in an unresolved plugin configuration.
 */
export interface PluginMeta<TInstance = unknown> {
  instance?: TInstance;
}

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

export const PLUGIN_INSTANCE_REFERENCE_TYPE = "plugin-instance-reference" as const;

export type PluginInstanceReferenceType = typeof PLUGIN_INSTANCE_REFERENCE_TYPE;

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

/** Identifies which configuration source is being validated. */
export type OptionsContext = "defaultMountOptions" | "mountOptions" | "extraOptions";

/** Forbid instance metadata and capture controls on install-based plugins. */
type PluginOptionsWithoutInstance<TOptions> = ResolvablePluginOptions<TOptions> & {
  [PLUGIN_EXPOSE]?: never;
  [PLUGIN_META_KEY]?: never;
};

/**
 * Configuration for managed plugins.
 *
 * Only names in `PluginInstanceMap` can capture or reuse instances.
 * Native options may be omitted only when a pre-created instance is supplied.
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

export interface PresetDefinition {
  /** Plugins available in the preset and their enabled state. */
  manifest: PluginManifestEntry<any, any>[];

  /** Optional per-plugin defaults; not every manifest entry needs defaults. */
  defaults: PluginConfigDefaults;
}

export type TestFrameworkPresets = Record<string, PresetDefinition>;

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

export type ComponentSlotsInput<T extends Component> = Partial<{
  [K in keyof ComponentSlots<T>]: RelaxedSlot<ComponentSlots<T>[K]>;
}>;

/** Matches the data inference used by Vue Test Utils. */
export type ComponentData<T extends Component> = T extends { data?(...args: any): infer D }
  ? D extends Record<string, any>
    ? D
    : Record<string, never>
  : Record<string, never>;

export type ComponentDataInput<T extends Component> = Partial<ComponentData<T>>;

export type PresetKey = keyof TestFrameworkPresets;

export interface ComponentFactoryConfig {
  /** Select the default preset for this component factory. */
  presetKey?: PresetKey;
}

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

export type ComponentFactoryExtraOptions = {
  /** Select the preset used for this factory call. */
  presetKey?: PresetKey;

  /** Skip factory-level default props. */
  skipDefaultProps?: boolean;

  /** Skip factory-level default slots. */
  skipDefaultSlots?: boolean;

  /** Skip base mount options. */
  skipDefaultOptions?: boolean;

  plugins?: PluginOverridesInput;
};

/**
 * Component factory returned by `testComponentFactory()`.
 * The wrapper return type mirrors Vue Test Utils `mount()`.
 */
export type ComponentFactory<T extends Component> = (
  props?: ComponentPropsInput<T>,
  mountOptions?: ComponentFactoryOptions<
    ComponentPropsInput<T>,
    ComponentSlotsInput<T>,
    ComponentDataInput<T>
  >,
  slots?: ComponentSlotsInput<T>,
  extraOptions?: ComponentFactoryExtraOptions,
) => ReturnType<typeof mount<T>>;

export interface ComponentFactoryCreator {
  <T extends Component>(
    component: T,
    defaultProps?: ComponentPropsInput<T>,
    defaultMountOptions?: ComponentFactoryOptions<
      ComponentPropsInput<T>,
      ComponentSlotsInput<T>,
      ComponentDataInput<T>
    >,
    defaultSlots?: ComponentSlotsInput<T>,
  ): ComponentFactory<T>;

  withOptions<T extends Component>(
    options: ComponentFactoryCreationOptions<T>,
  ): ComponentFactory<T>;
}

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

export type CreateTestFrameworkOptions = SinglePresetOptions | MultiplePresetsOptions;

// =============================================================================
// 7. Runtime configuration and mount pipeline
// =============================================================================

// Middleware accumulates runtime state without component-specific generics.
export type RuntimePluginConfig = Record<PropertyKey, any>;

export type RuntimePluginOption = RuntimePluginConfig | false;

export type ResolvedPluginOptions = Record<PluginName, RuntimePluginOption>;

export type ResolvedPluginDefaults = Record<PluginName, RuntimePluginConfig>;

export type ResolvedPluginConfig = RuntimePluginConfig & PluginMetaOptions;

export type PluginOverlay = ResolvedPluginConfig | false;

export type RuntimePluginState = RuntimePluginConfig & {
  [SHARED_PLUGIN_INSTANCE_KEY]?: unknown;
};

/** Extra options after plugin overrides have been resolved. */
export type RuntimeExtraOptions = {
  preset?: keyof TestFrameworkPresets;
  skipDefaultProps?: boolean;
  skipDefaultSlots?: boolean;
  skipDefaultOptions?: boolean;
  plugins?: ResolvedPluginOptions;
};

export interface CreatePipelineContextParams {
  defaultMountOptions?: ComponentFactoryOptions;
  mountOptions?: ComponentFactoryOptions;
  extraOptions?: ComponentFactoryExtraOptions;
  presets?: TestFrameworkPresets;
}

export interface PipelineContext {
  defaultMountOptions: ComponentFactoryOptions;
  mountOptions: ComponentFactoryOptions;
  extraOptions: ComponentFactoryExtraOptions;
  supportedPlugins: SupportedPluginsMap;
  preset: PresetDefinition | undefined;
  result: PipelineContextResult;
}

declare const RuntimeContextBrand: unique symbol;

export interface RuntimeContext extends PipelineContext {
  readonly [RuntimeContextBrand]: true;
}

declare const MountReadyBrand: unique symbol;

export interface MountReadyContext extends RuntimeContext {
  extraOptions: RuntimeExtraOptions;

  readonly [MountReadyBrand]: true;
}

/** VTU mount state without a component-specific Props/Data type. */
type MountOptionsState = Partial<MountingOptions<any, any>>;

export interface PipelineContextResult {
  mountOptions: MountOptionsState;
  global: NonNullable<MountingOptions<any, any>["global"]>;
  pluginDefaultsState: ResolvedPluginDefaults;
  plugins: ResolvedPluginOptions;
}

export type PipelineResultPatch = {
  mountOptions?: Partial<PipelineContextResult["mountOptions"]>;
  plugins?: Partial<PipelineContextResult["plugins"]>;
  pluginDefaultsState?: Partial<PipelineContextResult["pluginDefaultsState"]>;
  global?: Partial<PipelineContextResult["global"]>;
};

export type PipelineMiddleware<
  In extends PipelineContext = PipelineContext,
  Out extends PipelineContext = In,
> = (ctx: In) => Out;

export interface Pipeline<In = PipelineContext, Out = In> {
  run: (ctx: In) => Out;
}

export type PipeResult<In, Ms extends readonly any[]> = Ms extends readonly [
  ...any[],
  infer Last extends (...args: any[]) => any,
]
  ? ReturnType<Last>
  : In;

export interface MountRuntimeOptions {
  shallowByDefault: boolean;
}

// =============================================================================
// 8. Shared utility types
// =============================================================================

export type PlainObject = Record<string, unknown>;

export type Mergeable = PlainObject | unknown[];

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

export type MountWithPluginsOptions<Props = any, Slots = any, Data = any> = ComponentFactoryOptions<
  Props,
  Slots,
  Data
>;
