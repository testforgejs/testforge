// Re-exporting functions from an existing structure
export { createTestFramework } from "./core/createTestFramework.js";
export { createPluginInstance } from "./plugins/instances/createPluginInstance.js";
export { createVuePlugin } from "./plugins/install/createVuePlugin.js";
export { captureInstance } from "./utils/captureInstance.js";
export { extendPreset } from "./presets/extendPreset.js";
export { fromPluginInstance } from "./plugins/dependencies/fromPluginInstance.js";
export { validatePreset } from "./presets/validators/validatePreset.js";
export { validatePresets } from "./presets/validators/validatePresets.js";

// Public types
export type {
  ComponentFactory,
  ComponentFactoryCreator,
  ComponentFactoryOptions,
  ComponentFactoryExtraOptions,
  CreateTestFrameworkOptions,
  MountPlugin,
  PluginDefaultOptionsFactory,
  PluginOptionsFactory,
  PluginInstanceMap,
  PluginInstanceReference,
  PluginOptionsMap,
  PluginOptionsInput,
  PluginOverridesInput,
  PluginControlOptions,
  PluginManifestEntry,
  PluginModule,
  PluginModuleWithDefaults,
  PresetDefinition,
  PresetExtension,
  TestFramework,
  TestFrameworkPresets,
  UniversalRunner,
} from "./types";

// For backward compatibility
export const Types = {} as const;
