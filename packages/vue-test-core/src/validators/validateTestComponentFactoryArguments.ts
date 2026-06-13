import { ERROR_PREFIX } from "../constants/constants.js";
import { validatePlainObjectArgument } from "./validatePlainObjectArgument.js";
import { validateComponentFactoryOptions } from "./validateComponentFactoryOptions.js";

import type { ComponentFactoryOptions, TestFrameworkPresets } from "../types";

/*
 * Validates testComponentFactory() arguments.
 *
 * Validation rules:
 * - component must be a valid Vue component
 * - defaultProps must be a plain object
 * - defaultMountOptions must be a plain object
 * - defaultSlots must be a plain object
 */
export function validateTestComponentFactoryArguments(
  component: unknown,
  defaultProps: unknown,
  defaultMountOptions: unknown,
  defaultSlots: unknown,
  presets: TestFrameworkPresets,
): void {
  // Vue component
  const isComponent =
    component !== null && (typeof component === "object" || typeof component === "function");

  if (!isComponent) {
    throw new Error(`${ERROR_PREFIX} testComponentFactory() requires a valid Vue component.`);
  }

  validatePlainObjectArgument(defaultProps, "defaultProps");
  validateComponentFactoryOptions(
    defaultMountOptions as ComponentFactoryOptions,
    "defaultMountOptions",
    presets,
  );

  validatePlainObjectArgument(defaultSlots, "defaultSlots");
}
