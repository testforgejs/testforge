import type { TestFrameworkPresets } from "../types.js";

/*
 * Validates the options specific to the object-based
 * component factory creation API.
 *
 * Validation of component, defaultProps, defaultMountOptions,
 * and defaultSlots is delegated to the existing factory validator.
 */
export function validateComponentFactoryCreationOptions(
  options: unknown,
  presets: TestFrameworkPresets,
): void {
  // Validate the root options object.
  if (
    typeof options !== "object" ||
    options === null ||
    Array.isArray(options) ||
    (Object.getPrototypeOf(options) !== Object.prototype && Object.getPrototypeOf(options) !== null)
  ) {
    throw new Error('"options" must be a plain object.');
  }

  const { presetKey } = options as Record<string, unknown>;

  // Preset selection is optional.
  if (presetKey === undefined) {
    return;
  }

  // Validate the preset key type.
  if (typeof presetKey !== "string") {
    throw new Error('"presetKey" must be a string.');
  }

  // Validate that the preset exists in the framework registry.
  if (!Object.prototype.hasOwnProperty.call(presets, presetKey)) {
    throw new Error(`Preset "${presetKey}" is not registered.`);
  }
}
