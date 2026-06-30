// Re-exporting functions from an existing structure
export { createTestFramework } from "./core/createTestFramework.js";
export { createPluginInstance } from "./pluginsRegistry/factory/createPluginInstance.js";
export { createVuePlugin } from "./pluginsRegistry/factory/createVuePlugin.js";
export { captureInstance } from "./utils/captureInstance.js";
export { validatePreset } from "./validators/validatePreset.js";
export { validatePresets } from "./validators/validatePresets.js";

// Public types
export type {
  ComponentFactory,
  ComponentFactoryCreator,
  ComponentFactoryOptions,
  ComponentFactoryExtraOptions,
  MountPlugin,
  PluginOptionsMap,
  PluginOptionsInput,
  PluginOverridesInput,
  PluginControlOptions,
  PluginModule,
  PresetDefinition,
  TestFramework,
  TestFrameworkPresets,
} from "./types";

// For backward compatibility
export const Types = {} as const;
