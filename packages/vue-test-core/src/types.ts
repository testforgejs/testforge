import type { Component } from "vue";
import type { VueWrapper, MountingOptions } from "@vue/test-utils";

// === 1. Core Plugin Model ===

/** Plugin name (e.g., ‘pinia’, ‘i18n’, ‘router’) */
export type PluginName = string;

export interface PluginMeta {
  instance?: unknown;
}

export type PluginConfig = Record<string, any>;

export type PluginOption = PluginConfig | false;

export type ResolvedPluginConfig = PluginConfig & {
  __meta?: PluginMeta;
};

export type PluginOverlay = ResolvedPluginConfig | false;

export type RuntimePluginConfig = PluginConfig & {
  __sharedInstance?: unknown;
};

// === 2. Built-in Plugin Options ===

// === 3. Plugin Registry System ===

export interface PluginDefinition<TInstance = unknown, TOptions = unknown> {
  beforeCreate?: (ctx: MountContext, options: TOptions) => TOptions;
  create: (options: TOptions) => TInstance;
  afterCreate?: (instance: TInstance, ctx: MountContext) => void;
}

export interface PluginModule<TInstance = unknown, TOptions = unknown> {
  getName(): PluginName;
  getDefinition(): PluginDefinition<TInstance, TOptions>;
}

export interface PluginRegistry {
  register(entry: PluginManifestEntry): void;
  get(name: PluginName): PluginDefinition<any, any> | undefined;
  has(name: PluginName): boolean;
  entries(): IterableIterator<[PluginName, PluginDefinition<any, any>]>;
  getNames(): PluginName[];
}

export interface PluginManifestEntry<TInstance = unknown, TOptions = unknown> {
  module: PluginModule<TInstance, TOptions>;
  enabled: boolean;
}

export type SupportedPluginState = PluginConfig | false;

export type SupportedPluginsMap = Record<PluginName, SupportedPluginState>;

// === 4. Plugin Runtime ===

export type PluginFactory<TInstance = unknown, TOptions = unknown> = (
  options: TOptions,
) => TInstance;

export interface PluginRuntimeMeta<T> {
  __sharedInstance?: T;
  expose?: (instance: T) => void;
}

export type RuntimePluginOptions<T, TOptions = object> = TOptions & PluginRuntimeMeta<T>;

export interface InstanceCapture<T> {
  expose(instance: T): void;
  readonly instance: T | undefined;
}

export interface ExposeOption<T> {
  expose?: (instance: T) => void;
}

// === 5. Public Plugin Configuration API ===

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface PluginOptionsMap {}

export interface PluginControlOptions<TInstance> {
  expose?: (instance: TInstance) => void;
}

export type PluginOptionsInput = {
  [K in keyof PluginOptionsMap]?: PluginOptionsMap[K] | false;
};

export type PluginOverride<T = unknown> =
  | (T extends Record<string, any>
      ? Partial<T> & { __meta?: PluginMeta }
      : T & { __meta?: PluginMeta })
  | false;

export type PluginOverridesInput = {
  [K in keyof PluginOptionsMap]?: PluginOverride<PluginOptionsMap[K]>;
};

export type PluginOptions = Record<PluginName, PluginOption>;

export type PluginConfigDefaults = Record<PluginName, PluginConfig>;

export type PluginConfigOverrides = Partial<Record<PluginName, PluginOverlay>>;

export type ComponentFactoryExtraOptions = {
  /**
   * Name of the preset to activate for this factory call.
   * Controls which plugins and defaults will be applied.
   */
  preset?: keyof TestFrameworkPresets;

  /**
   * Skip factory-level default props during merge.
   */
  skipDefaultProps?: boolean;

  /**
   * Skip factory-level default slots during merge.
   */
  skipDefaultSlots?: boolean;

  /**
   * Skip BASE_MOUNT_OPTIONS during merge.
   */
  skipDefaultOptions?: boolean;
} & PluginOverridesInput;

// === 6. Preset System ===

export interface PresetDefinition {
  manifest: PluginManifestEntry[];
  defaults: PluginConfigDefaults;
}

export type TestFrameworkPresets = Record<string, PresetDefinition>;

// === 7. Pipeline Types ===

export interface CreateMountContextParams {
  defaultMountOptions?: ComponentFactoryOptions;
  mountOptions?: ComponentFactoryOptions;
  extraOptions?: ComponentFactoryExtraOptions;
  presets?: TestFrameworkPresets;
}

export interface MountContext {
  defaultMountOptions: ComponentFactoryOptions;
  mountOptions: ComponentFactoryOptions;
  extraOptions: ComponentFactoryExtraOptions;
  supportedPlugins: SupportedPluginsMap;
  preset: PresetDefinition | undefined;
  result: MountContextResult;
}

type MountOptionsState = Partial<MountingOptions<any>>;

export interface MountContextResult {
  mountOptions: MountOptionsState;
  global: NonNullable<MountingOptions<any>["global"]>;
  pluginPresets: PluginConfigDefaults;
  plugins: PluginOptions;
}

export type MountResultPatch = {
  mountOptions?: Partial<MountContextResult["mountOptions"]>;
  plugins?: Partial<MountContextResult["plugins"]>;
  pluginPresets?: Partial<MountContextResult["pluginPresets"]>;
  global?: Partial<MountContextResult["global"]>;
};

export interface ResultReadyContext extends MountContext {
  result: {
    mountOptions: MountContextResult["mountOptions"];
    global: MountContextResult["global"];
    plugins: MountContextResult["plugins"];
    pluginPresets: MountContextResult["pluginPresets"];
  };
}

export interface PluginOptionsReadyContext extends MountContext {
  result: MountContext["result"] & {
    plugins: PluginOptions;
  };

  extraOptions: MountContext["extraOptions"] & Partial<PluginOptions>;
}

export type PipelineMiddleware<In = MountContext, Out = In> = (ctx: In) => Out;

export interface Pipeline<In = MountContext, Out = In> {
  run: (ctx: In) => Out;
}

export type PipeResult<
  In,
  Ms extends readonly PipelineMiddleware<any, any>[],
> = Ms extends readonly [PipelineMiddleware<any, infer Out>, ...infer Rest]
  ? Rest extends readonly PipelineMiddleware<any, any>[]
    ? PipeResult<Out, Rest>
    : Out
  : In;

// === 8. Component Factory ===

export interface ComponentFactoryOptions<Props = any, Data = any> extends MountingOptions<
  Props,
  Data
> {
  /** Use shallowMount() instead of mount() */
  useShallow?: boolean;

  /** Managed plugin configuration */
  plugins?: PluginOptionsInput; //PluginOptions;

  /** Disable managed plugins from presets */
  skipManagedPlugins?: boolean;
}

/** Main component factory returned by testComponentFactory */
export type ComponentFactory<T extends abstract new (...args: any) => any = any> = (
  props?: Dictionary,
  mountOptions?: ComponentFactoryOptions,
  slots?: SlotsMap,
  extraOptions?: ComponentFactoryExtraOptions,
) => VueWrapper<InstanceType<T>>;

export interface CreateTestFrameworkOptions {
  /** Preset configurations for plugins */
  presets?: TestFrameworkPresets;
}

export interface TestFramework {
  testComponentFactory<T extends abstract new (...args: any) => any>(
    component: Component,
    defaultProps?: Dictionary,
    defaultMountOptions?: ComponentFactoryOptions,
    defaultSlots?: SlotsMap,
  ): ComponentFactory<T>;
}

// === 9. Utility Types ===

export type PlainObject = Record<string, unknown>;

export type Dictionary<V = unknown> = Record<string, V>;

export type SlotsMap = MountingOptions<any>["slots"];

export interface MergeComponentDataParams<V = unknown> {
  // Level 1: Test Suite / Factory defaults
  defaultMountData?: Record<string, V>;
  defaultData?: Record<string, V>;

  // Level 2: Specific test
  mountData?: Record<string, V>;
  directData?: Record<string, V>;

  // Control flags
  skipDefault?: boolean;
  skipOptions?: boolean;
}

export type MountWithPluginsOptions = ComponentFactoryOptions & MountingOptions<Component>;
