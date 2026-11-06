import { ERROR_PREFIX } from "../constants/constants.js";

/*
 * Validates optional default configuration resolvers
 * used by the positional component factory API.
 *
 * Each argument must be a function or undefined.
 * Resolvers are not invoked during validation.
 */
export function validateComponentFactoryDefaultResolvers(
  defaultProps: unknown,
  defaultMountOptions: unknown,
  defaultSlots: unknown,
): void {
  const resolvers = {
    defaultProps,
    defaultMountOptions,
    defaultSlots,
  };

  for (const [name, resolver] of Object.entries(resolvers)) {
    if (resolver !== undefined && typeof resolver !== "function") {
      throw new Error(`${ERROR_PREFIX} "${name}" must be a function.`);
    }
  }
}
