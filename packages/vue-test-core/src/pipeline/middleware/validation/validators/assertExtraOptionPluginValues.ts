import type { RuntimeExtraOptions } from "../../../../types";

import { assertPluginValue } from "../../typeGuards/assertPluginValue";

/*
 * Validates plugin override values coming from extraOptions.
 */
export const assertExtraOptionPluginValues = (
  extraOptions: RuntimeExtraOptions,
  supported: Set<string>,
): void => {
  for (const name of supported) {
    if (Object.prototype.hasOwnProperty.call(extraOptions, name)) {
      assertPluginValue(extraOptions[name], name, "extraOptions");
    }
  }
};
