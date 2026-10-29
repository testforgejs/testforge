import { ERROR_PREFIX, PLUGIN_EXPOSE } from "../../../../constants/constants.js";

import type { ComponentFactoryOptions } from "../../../../types.js";

/*
 * Rejects instance capture callbacks in factory-level plugin defaults.
 *
 * Default mount options are reused across component mounts.
 * Capturing plugin instances at this level would allow subsequent
 * mounts to overwrite instances captured by earlier mounts.
 *
 * Instance capturing must be configured per mount instead.
 */
export function assertNoDefaultInstanceCapture(defaultMountOptions: ComponentFactoryOptions): void {
  const plugins = defaultMountOptions.plugins;

  if (!plugins) {
    return;
  }

  for (const [pluginName, options] of Object.entries(plugins)) {
    if (
      options !== null &&
      typeof options === "object" &&
      Object.prototype.hasOwnProperty.call(options, PLUGIN_EXPOSE)
    ) {
      throw new Error(
        `${ERROR_PREFIX} Instance capture is not allowed in ` +
          `defaultMountOptions.plugins.${pluginName}. ` +
          "Use captureInstance() in mountOptions or extraOptions for each component mount.",
      );
    }
  }
}
