import { ERROR_PREFIX } from "../constants/constants.js";

/*
 * Ensures that configured plugins are declared
 * in the selected preset's manifest.
 *
 * The presetDescription parameter customizes the error message
 * without changing the validation rules.
 */
export function assertUnsupportedPlugins(
  plugins: object,
  supported: ReadonlySet<string>,
  presetDescription = "the active preset",
): void {
  for (const name of Object.keys(plugins)) {
    if (!supported.has(name)) {
      throw new Error(
        `${ERROR_PREFIX} Plugin "${name}" is configured but not supported by ${presetDescription}.`,
      );
    }
  }
}
