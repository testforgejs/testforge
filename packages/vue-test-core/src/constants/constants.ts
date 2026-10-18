export const FRAMEWORK_NAME = "TestForge" as const;
export const ERROR_PREFIX = `[${FRAMEWORK_NAME}]` as const;
export const DEFAULT_PRESET_NAME = "default" as const;
export const PLUGIN_META_KEY = "__meta" as const;
export const SHARED_PLUGIN_INSTANCE_KEY = Symbol("testforge.sharedPluginInstance");
export const OPAQUE_PLUGIN_CONFIG_KEYS = [SHARED_PLUGIN_INSTANCE_KEY] as const;
export const OPAQUE_PLUGIN_CONFIG_KEY_SET: ReadonlySet<PropertyKey> = new Set(
  OPAQUE_PLUGIN_CONFIG_KEYS,
);
export const PLUGIN_EXPOSE = Symbol("TestForge.pluginExpose");
