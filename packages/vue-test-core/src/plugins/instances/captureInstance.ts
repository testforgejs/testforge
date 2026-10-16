import { PLUGIN_EXPOSE } from "../../constants/constants.js";

import type { InstanceCapture } from "../../types";

/*
 * Creates a helper for capturing managed plugin instances.
 *
 * The capture callback is exposed through an internal symbol
 * so it can be spread into plugin configuration without
 * conflicting with native plugin options.
 *
 * The public `instance` getter is non-enumerable
 * and is not included in spread options.
 */
export function captureInstance<T = unknown>(): InstanceCapture<T> {
  let instance: T | undefined;

  const capture: InstanceCapture<T> = {
    [PLUGIN_EXPOSE]: (ins: T): void => {
      instance = ins;
    },

    get instance(): T | undefined {
      return instance;
    },
  };

  Object.defineProperties(capture, {
    instance: {
      enumerable: false,
    },
  });

  return capture;
}
