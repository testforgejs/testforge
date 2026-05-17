/**
 * Validates the preset structure, manifest entries, and default options.
 *
 * @param {string} name - Preset name for error reporting
 * @param {object} preset - The preset object to validate
 * @throws {Error} If the preset structure is invalid or inconsistent
 */
export function validatePreset(name, preset) {
  if (!preset) {
    throw new Error(`[Validator] Preset "${name}" is null or undefined.`);
  }

  if (!Array.isArray(preset.manifest)) {
    throw new Error(`[Validator] Preset "${name}" must have a "manifest" array.`);
  }

  const manifestPluginNames = new Set();

  // 1. Manifest validation
  preset.manifest.forEach((entry, index) => {
    const { module, enabled } = entry;

    if (!module || typeof module.getName !== "function") {
      throw new Error(`[Validator] Invalid module at manifest[${index}] in preset "${name}".`);
    }

    const pluginName = module.getName();
    if (manifestPluginNames.has(pluginName)) {
      throw new Error(
        `[Validator] Duplicate plugin "${pluginName}" in manifest of preset "${name}".`,
      );
    }

    if (typeof enabled !== "boolean") {
      throw new Error(
        `[Validator] Plugin "${pluginName}" in preset "${name}" must have a boolean "enabled" flag.`,
      );
    }

    manifestPluginNames.add(pluginName);
  });

  // 2. Validation of defaults (manifest compliance)
  if (preset.defaults) {
    const defaultKeys = Object.keys(preset.defaults);

    defaultKeys.forEach((key) => {
      if (!manifestPluginNames.has(key)) {
        throw new Error(
          `[Validator] Preset "${name}" contains defaults for unknown plugin "${key}". ` +
            `This plugin is not present in the manifest.`,
        );
      }

      const value = preset.defaults[key];
      const isObject = value !== null && typeof value === "object" && !Array.isArray(value);

      if (value !== false && !isObject) {
        throw new Error(
          `[Validator] Invalid default configuration for plugin "${key}" in preset "${name}". ` +
            `Expected Object or false, but received ${typeof value}.`,
        );
      }
    });
  }
}
