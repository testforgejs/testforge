import { validatePlainObjectArgument } from "./validatePlainObjectArgument.js";
import { validateBooleanOption } from "./validateBooleanOption.js";

import type { ComponentFactoryExtraOptions } from "../types";

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
): void {
  validatePlainObjectArgument(props, "props");
  validatePlainObjectArgument(mountOptions, "mountOptions");
  validatePlainObjectArgument(slots, "slots");
  validatePlainObjectArgument(extraOptions, "extraOptions");

  const options = extraOptions as ComponentFactoryExtraOptions;

  validateBooleanOption(options.skipDefaultProps, "skipDefaultProps");

  validateBooleanOption(options.skipDefaultSlots, "skipDefaultSlots");

  validateBooleanOption(options.skipDefaultOptions, "skipDefaultOptions");
}
