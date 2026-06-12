import { ERROR_PREFIX } from "../constants/constants.js";
import { validatePlainObjectArgument } from "./validatePlainObjectArgument.js";

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
): void {
  // Vue component
  const isComponent =
    component !== null && (typeof component === "object" || typeof component === "function");

  if (!isComponent) {
    throw new Error(`${ERROR_PREFIX} testComponentFactory() requires a valid Vue component.`);
  }

  validatePlainObjectArgument(defaultProps, "defaultProps");
  validatePlainObjectArgument(defaultMountOptions, "defaultMountOptions");
  validatePlainObjectArgument(defaultSlots, "defaultSlots");
}
