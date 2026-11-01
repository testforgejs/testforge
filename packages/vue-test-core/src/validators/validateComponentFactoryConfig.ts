import { ERROR_PREFIX } from "../constants/constants.js";
import { validatePlainObjectArgument } from "./validatePlainObjectArgument.js";

import type { ComponentFactoryConfig, TestFrameworkPresets } from "../types.js";

/*
 * Validates component factory configuration.
 *
 * Validation rules:
 * - config must be a plain object
 * - presetKey must be a string when provided
 * - presetKey must reference a registered preset
 *
 * The context parameter identifies the public API argument
 * being validated ("config" or "options").
 */
export function validateComponentFactoryConfig(
  config: unknown,
  presets: TestFrameworkPresets,
  context: "config" | "options" = "config",
): asserts config is ComponentFactoryConfig {
  validatePlainObjectArgument(config, context);

  const { presetKey } = config as ComponentFactoryConfig;

  if (presetKey === undefined) {
    return;
  }

  if (typeof presetKey !== "string") {
    throw new Error(`${ERROR_PREFIX} "presetKey" must be a string.`);
  }

  if (!Object.prototype.hasOwnProperty.call(presets, presetKey)) {
    throw new Error(`${ERROR_PREFIX} Preset "${presetKey}" is not registered.`);
  }
}
