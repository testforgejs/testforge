import { ERROR_PREFIX } from "../constants/constants.js";
import { validatePlainObjectArgument } from "./validatePlainObjectArgument.js";

const ALLOWED_OPTION_KEYS = new Set(["props", "mountOptions", "slots", "extraOptions"]);

/*
 * Validates the top-level shape of `factory.withOptions()` arguments.
 *
 * Only the four positional argument names are accepted. Validation of
 * their values is delegated to the shared positional mount implementation.
 */
export function validateComponentFactoryInvocationOptions(options: unknown): void {
  validatePlainObjectArgument(options, "options");

  for (const key of Reflect.ownKeys(options as object)) {
    if (typeof key !== "string" || !ALLOWED_OPTION_KEYS.has(key)) {
      throw new Error(`${ERROR_PREFIX} Unknown option "${String(key)}" in "options".`);
    }
  }
}
