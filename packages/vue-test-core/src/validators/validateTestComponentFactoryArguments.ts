import { validatePlainObjectArgument } from "./validatePlainObjectArgument.js";
import { validateComponentFactoryOptions } from "./validateComponentFactoryOptions.js";
import { validateComponent } from "./validateComponent.js";

import type { ComponentFactoryOptions, TestFrameworkPresets, PresetKey } from "../types.js";

/*
 * Validates resolved component factory arguments.
 *
 * Validation rules:
 * - component must be a valid Vue component
 * - defaultProps must be a plain object
 * - defaultMountOptions must be valid mounting options
 * - defaultSlots must be a plain object
 *
 * Default mount options are validated against the factory-level
 * preset when provided, or the default preset otherwise.
 */
export function validateTestComponentFactoryArguments(
  component: unknown,
  defaultProps: unknown,
  defaultMountOptions: unknown,
  defaultSlots: unknown,
  presets: TestFrameworkPresets,
  presetKey?: PresetKey,
): void {
  validateComponent(component);

  validatePlainObjectArgument(defaultProps, "defaultProps");

  validateComponentFactoryOptions(
    defaultMountOptions as ComponentFactoryOptions,
    "defaultMountOptions",
    presets,
    presetKey === undefined ? undefined : { presetKey },
  );

  validatePlainObjectArgument(defaultSlots, "defaultSlots");
}
