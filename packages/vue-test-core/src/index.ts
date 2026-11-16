// Re-exporting functions from an existing structure
export { createTestFramework } from "./core/createTestFramework.js";
export { createPluginInstance } from "./plugins/instances/createPluginInstance.js";
export { createVuePlugin } from "./plugins/install/createVuePlugin.js";
export { captureInstance } from "./plugins/instances/captureInstance.js";
export { extendPreset } from "./presets/extendPreset.js";
export { fromPluginInstance } from "./plugins/dependencies/fromPluginInstance.js";
export { validatePreset } from "./presets/validators/validatePreset.js";
export { validatePresets } from "./presets/validators/validatePresets.js";
export { withPluginInstance } from "./plugins/helpers/withPluginInstance.js";

// Public types
export type {
  ComponentFactory,
  ComponentFactoryCreator,
  ComponentFactoryExtraOptions,
  ComponentFactoryCreationOptions,
  ComponentFactoryInvocationOptions,
  ComponentFactoryOptions,
  CreateTestFrameworkOptions,
  DefaultMountOptionsResolver,
  DefaultPropsResolver,
  DefaultSlotsResolver,
  FactoryOptionsResolver,
  MountPlugin,
  PluginDefaultOptionsFactory,
  PluginDefinition,
  PluginOptionsFactory,
  PluginInstanceMap,
  PluginInstanceReference,
  PluginOptionsMap,
  PluginOptionsInput,
  PluginOverridesInput,
  PluginManifestEntry,
  PluginModule,
  PluginModuleWithDefaults,
  PluginName,
  PresetDefinition,
  PresetExtension,
  RuntimePluginOptions,
  TestFramework,
  TestFrameworkPresets,
  UniversalRunner,
} from "./types.js";

// For backward compatibility
export const Types = {} as const;
