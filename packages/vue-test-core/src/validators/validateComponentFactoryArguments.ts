import { validatePlainObjectArgument } from "./validatePlainObjectArgument.js";
import { validateComponentFactoryOptions } from "./validateComponentFactoryOptions.js";
import { validateComponentFactoryExtraOptions } from "./validateComponentFactoryExtraOptions.js";

import type {
  ComponentFactoryOptions,
  ComponentFactoryExtraOptions,
  TestFrameworkPresets,
} from "../types.js";

/*
 * Validates component factory invocation arguments.
 *
 * Validation rules:
 * - props, mountOptions, slots, and extraOptions must be plain objects
 * - extraOptions is validated before preset-dependent mount options
 * - mountOptions validation uses the effective preset
 *
 * The caller resolves factory-level preset defaults before invoking
 * this validator.
 */
export function validateComponentFactoryArguments(
  props: unknown,
  mountOptions: unknown,
  slots: unknown,
  extraOptions: unknown,
  presets: TestFrameworkPresets = {},
): void {
  validatePlainObjectArgument(props, "props");

  validatePlainObjectArgument(slots, "slots");

  // Validate preset selection before using it to inspect mountOptions.
  validateComponentFactoryExtraOptions(extraOptions as ComponentFactoryExtraOptions, presets);

  validateComponentFactoryOptions(
    mountOptions as ComponentFactoryOptions,
    "mountOptions",
    presets,
    extraOptions as ComponentFactoryExtraOptions,
  );
}
