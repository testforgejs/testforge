import type { ResolvedPluginOptions } from "../../../../types";

import { ERROR_PREFIX } from "../../../../constants/constants.js";

/*
 * Ensures that only plugins declared in the active preset
 * are configured by the user.
 */
export const assertUnsupportedPlugins = (
  plugins: ResolvedPluginOptions,
  supported: Set<string>,
): void => {
  for (const name of Object.keys(plugins)) {
    if (!supported.has(name)) {
      throw new Error(
        `${ERROR_PREFIX} Plugin "${name}" is configured but not supported by the active preset.`,
      );
    }
  }
};
