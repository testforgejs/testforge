// Re-exporting functions from an existing structure
export { createTestFramework } from "./core/createTestFramework.js";
export { createPluginInstance } from "./pluginsRegistry/factory/createPluginInstance.js";
export { captureInstance } from "./utils/captureInstance.js";
export { validatePreset } from "./utils/validatePreset.js";

// Public types
export type {
  ComponentFactory,
  ComponentFactoryOptions,
  ComponentFactoryExtraOptions,
  PluginOptionsMap,
  PluginOptionsInput,
  PluginOverridesInput,
  PluginControlOptions,
  RuntimePluginOptions,
  PluginModule,
  PresetDefinition,
  TestFrameworkPresets,
} from "./types";

// For backward compatibility
export const Types = {} as const;
