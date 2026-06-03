import type { RuntimeExtraOptions } from "../../../../types";

import { assertUnsupportedPlugins } from "./assertUnsupportedPlugins";

/*
 * Validates that extraOptions.plugins contains only plugins
 * supported by the active preset.
 *
 * Prevents configuration of plugins that are not present
 * in the preset plugin manifest.
 */
export const assertExtraOptionUnsupportedPlugins = (
  extraOptions: RuntimeExtraOptions,
  supported: Set<string>,
): void => {
  assertUnsupportedPlugins(extraOptions.plugins ?? {}, supported);
};
