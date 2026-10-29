import type { ResolvedPluginOptions } from "../../../../types.js";

import { assertPluginValue } from "../../typeGuards/assertPluginValue";

/*
 * Validates resolved plugin runtime state.
 */
export const assertResolvedPluginValues = (plugins: ResolvedPluginOptions): void => {
  for (const [name, value] of Object.entries(plugins)) {
    assertPluginValue(value, name, "plugins");
  }
};
