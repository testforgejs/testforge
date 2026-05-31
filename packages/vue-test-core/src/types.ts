import type { Component } from "vue";
import type { VueWrapper, MountingOptions } from "@vue/test-utils";

// === 1. Core Plugin Model ===

/** Plugin name (e.g., ‘pinia’, ‘i18n’, ‘router’) */
export type PluginName = string;

export type RuntimeVuePlugin = any;

// === 2. Plugin Registry System ===

export interface PluginDefinition<TInstance = unknown, TOptions = unknown> {
  beforeCreate?: (ctx: PipelineContext, options: TOptions) => TOptions;
  create: (options: TOptions) => TInstance;
  afterCreate?: (instance: TInstance, ctx: PipelineContext) => void;
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

export type SupportedPluginState = boolean;

export type SupportedPluginsMap = Record<PluginName, SupportedPluginState>;

export type PluginFactory<TInstance = unknown, TOptions = unknown> = (
  options: TOptions,
) => TInstance;

// === 3. Plugin Runtime Configuration ===

export type RuntimePluginConfig = Record<string, any>;

export type RuntimePluginOption = RuntimePluginConfig | false;

export type ResolvedPluginOptions = Record<PluginName, RuntimePluginOption>;

export type PluginConfigDefaults = Record<PluginName, RuntimePluginConfig>;

export type ResolvedPluginConfig = RuntimePluginConfig & {
  __meta?: PluginMeta;
};

export type PluginOverlay = ResolvedPluginConfig | false;

export type RuntimePluginState = RuntimePluginConfig & {
  __sharedInstance?: unknown;
};

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

export type RuntimeExtraOptions = {
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

  plugins?: ResolvedPluginOptions;
};

// === 4. Public Plugin Configuration API ===

export interface PluginMeta {
  instance?: unknown;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface PluginOptionsMap {}

export type PluginOptionsInput = {
  [K in keyof PluginOptionsMap]?: PluginOptionsMap[K] | false;
};

export interface PluginControlOptions<TInstance> {
  expose?: (instance: TInstance) => void;
}

export type PluginOverride<T = unknown> =
  | (T extends Record<string, any>
      ? Partial<T> & { __meta?: PluginMeta }
      : T & { __meta?: PluginMeta })
  | false;

export type PluginOverridesInput = {
  [K in keyof PluginOptionsMap]?: PluginOverride<PluginOptionsMap[K]>;
};

export interface ComponentFactoryOptions<Props = any, Data = any> extends MountingOptions<
  Props,
  Data
> {
  /** Use shallowMount() instead of mount() */
  useShallow?: boolean;

  /** Managed plugin configuration */
  plugins?: PluginOptionsInput;

  /** Disable managed plugins from presets */
  skipManagedPlugins?: boolean;
}

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

  plugins?: PluginOverridesInput;
};

// === 5. Preset System ===

export interface PresetDefinition {
  manifest: PluginManifestEntry<any, any>[];
  defaults: PluginConfigDefaults;
}

export type TestFrameworkPresets = Record<string, PresetDefinition>;

// === 6. Pipeline Types ===

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

type MountOptionsState = Partial<MountingOptions<any>>;

export interface PipelineContextResult {
  mountOptions: MountOptionsState;
  global: NonNullable<MountingOptions<any>["global"]>;
  pluginDefaultsState: PluginConfigDefaults;
  plugins: ResolvedPluginOptions;
}

export type PipelineResultPatch = {
  mountOptions?: Partial<PipelineContextResult["mountOptions"]>;
  plugins?: Partial<PipelineContextResult["plugins"]>;
  pluginDefaultsState?: Partial<PipelineContextResult["pluginDefaultsState"]>;
  global?: Partial<PipelineContextResult["global"]>;
};

export interface ResultReadyContext extends PipelineContext {
  result: {
    mountOptions: PipelineContextResult["mountOptions"];
    global: PipelineContextResult["global"];
    plugins: PipelineContextResult["plugins"];
    pluginDefaultsState: PipelineContextResult["pluginDefaultsState"];
  };
}

export interface PluginOptionsReadyContext extends PipelineContext {
  result: PipelineContext["result"] & {
    plugins: ResolvedPluginOptions;
  };

  extraOptions: RuntimeExtraOptions;
}

export type PipelineMiddleware<In = PipelineContext, Out = In> = (ctx: In) => Out;

export interface Pipeline<In = PipelineContext, Out = In> {
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

// === 7. Component Factory ===

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

// === 8. Utility Types ===

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
