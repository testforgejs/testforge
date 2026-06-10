import type { Component } from "vue";
import type { MountingOptions, mount } from "@vue/test-utils";
import type { ComponentProps, ComponentSlots } from "vue-component-type-helpers";

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
// Runtime state accumulated by middleware.
// Component-specific generic information is intentionally erased.

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

export interface ComponentFactoryOptions<Props = any, Slots = any, Data = any> extends Omit<
  MountingOptions<Props, Data>,
  "props" | "slots" | "data"
> {
  /** Strictly typed data */
  data?: () => Data;

  /** Strictly typed props */
  props?: Props;

  /** Strictly typed slots */
  slots?: Slots;

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

/**
 * Default plugin configuration.
 *
 * The object keys must correspond to plugin names returned by
 * `plugin.getName()` for plugins declared in `manifest`.
 */
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

/**
 * Runtime type.
 *
 * The pipeline operates without knowledge of a specific component,
 * therefore Props/Data generics are intentionally erased.
 */
type MountOptionsState = Partial<MountingOptions<any, any>>;

export interface PipelineContextResult {
  mountOptions: MountOptionsState;
  global: NonNullable<MountingOptions<any, any>["global"]>;
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

/**
 * Input props accepted by TestForge.
 *
 * Props are intentionally typed as Partial<ComponentProps<T>>.
 *
 * TestForge merges props from multiple sources:
 * - factory defaults
 * - mount option props
 * - per-test props
 *
 * Because each source represents only a partial contribution
 * to the final prop set, requiring complete component props
 * at every layer would be unnecessarily restrictive.
 */
export type ComponentPropsInput<T extends Component> = Partial<ComponentProps<T>>;

type RelaxedSlot<T> = T extends (props: infer P) => unknown ? (props: P) => unknown : () => unknown;

export type ComponentSlotsInput<T extends Component> = Partial<{
  [K in keyof ComponentSlots<T>]: RelaxedSlot<ComponentSlots<T>[K]>;
}>;

// The exact equivalent of the type from Vue Test Utils
export type ComponentData<T extends Component> = T extends { data?(...args: any): infer D }
  ? D extends Record<string, any>
    ? D
    : Record<string, never>
  : Record<string, never>;

export type ComponentDataInput<T extends Component> = Partial<ComponentData<T>>;

/**
 * Main component factory returned by testComponentFactory
 *
 * Preserve exact Vue Test Utils wrapper typing.
 *
 * TestForge intentionally mirrors VTU mount() return types
 * instead of maintaining a parallel wrapper type hierarchy.
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

export interface CreateTestFrameworkOptions {
  /** Preset configurations for plugins */
  presets?: TestFrameworkPresets;

  /**
   * Default value for Vue Test Utils `shallow` mounting.
   *
   * Used when a factory call does not explicitly provide
   * the `shallow` option.
   *
   * @default false
   */
  shallowByDefault?: boolean;
}

export interface MountRuntimeOptions {
  shallowByDefault: boolean;
}

export interface TestFramework {
  /**
   * Creates a reusable component mounting factory.
   */
  testComponentFactory<T extends Component>(
    component: T,
    defaultProps?: ComponentPropsInput<T>,
    defaultMountOptions?: ComponentFactoryOptions<
      ComponentPropsInput<T>,
      ComponentSlotsInput<T>,
      ComponentDataInput<T>
    >,
    defaultSlots?: ComponentSlotsInput<T>,
  ): ComponentFactory<T>;
}

// === 8. Utility Types ===

export type PlainObject = Record<string, unknown>;

export interface MergeComponentDataParams<T extends object> {
  // Level 1: Test Suite / Factory defaults
  defaultMountData?: T | null;
  defaultData?: T | null;

  // Level 2: Specific test
  mountData?: T | null;
  directData?: T | null;

  // Control flags
  skipDefault?: boolean;
  skipOptions?: boolean;
}

export type MountWithPluginsOptions<Props = any, Slots = any, Data = any> = ComponentFactoryOptions<
  Props,
  Slots,
  Data
>;
