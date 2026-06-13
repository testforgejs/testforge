import { validatePlainObjectArgument } from "./validatePlainObjectArgument.js";
import { validateComponentFactoryOptions } from "./validateComponentFactoryOptions.js";
import { validateComponentFactoryExtraOptions } from "./validateComponentFactoryExtraOptions.js";

import type {
  ComponentFactoryOptions,
  ComponentFactoryExtraOptions,
  TestFrameworkPresets,
} from "../types";

/*
 * Validates component factory invocation arguments.
 *
 * Validation rules:
 * - props must be a plain object
 * - mountOptions must be a plain object
 * - slots must be a plain object
 * - extraOptions must be a plain object
 * - skipDefaultProps must be a boolean when provided
 * - skipDefaultSlots must be a boolean when provided
 * - skipDefaultOptions must be a boolean when provided
 */
export function validateComponentFactoryArguments(
  props: unknown,
  mountOptions: unknown,
  slots: unknown,
  extraOptions: unknown,
  presets: TestFrameworkPresets = {},
): void {
  validatePlainObjectArgument(props, "props");
  validateComponentFactoryOptions(
    mountOptions as ComponentFactoryOptions,
    "mountOptions",
    presets,
    extraOptions as ComponentFactoryExtraOptions,
  );
  validatePlainObjectArgument(slots, "slots");

  validateComponentFactoryExtraOptions(extraOptions as ComponentFactoryExtraOptions, presets);
}
