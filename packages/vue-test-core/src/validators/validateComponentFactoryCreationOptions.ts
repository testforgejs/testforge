import { validateComponentFactoryConfig } from "./validateComponentFactoryConfig.js";

import type { TestFrameworkPresets } from "../types.js";

/*
 * Validates options for the object-based component factory API.
 *
 * Factory configuration validation is delegated to
 * validateComponentFactoryConfig().
 *
 * Validation of component, defaultProps, defaultMountOptions,
 * and defaultSlots is handled by the existing factory validator.
 */
export function validateComponentFactoryCreationOptions(
  options: unknown,
  presets: TestFrameworkPresets,
): void {
  validateComponentFactoryConfig(options, presets, "options");
}
