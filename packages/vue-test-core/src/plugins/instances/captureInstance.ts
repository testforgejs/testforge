import { PLUGIN_EXPOSE } from "../../constants/constants.js";

import type { InstanceCapture } from "../../types.js";

/*
 * Creates a helper for capturing a managed plugin instance.
 *
 * The capture callback is exposed through an internal symbol
 * so it can be spread into plugin configuration without
 * conflicting with native plugin options.
 *
 * The public `instance` getter is non-enumerable
 * and is not included in spread options.
 *
 * Each capture helper should be used for a single component mount.
 * Reusing it across mounts overwrites the previously captured instance.
 *
 * Specify `T` explicitly to enable type-safe instance capturing.
 * Without an explicit type, the captured instance is typed as `unknown`.
 *
 * @typeParam T - The expected type of the managed plugin instance.
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
