// Re-exporting functions from an existing structure
export { createTestFramework } from "./core/createTestFramework.js";
export { createPluginInstance } from "./pluginsRegistry/factory/createPluginInstance.js";
export { createVuePlugin } from "./pluginsRegistry/factory/createVuePlugin.js";
export { captureInstance } from "./utils/captureInstance.js";
export { extendPreset } from "./presets/extendPreset.js";
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
  PluginOptionsFactory,
  PluginOptionsMap,
  PluginOptionsInput,
  PluginOverridesInput,
  PluginControlOptions,
  PluginManifestEntry,
  PluginModule,
  PresetDefinition,
  PresetExtension,
  TestFramework,
  TestFrameworkPresets,
} from "./types";

// For backward compatibility
export const Types = {} as const;
