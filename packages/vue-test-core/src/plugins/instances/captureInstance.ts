import { PLUGIN_EXPOSE } from "../../constants/constants.js";

import type { InstanceCapture } from "../../types.js";

/**
 * Creates a handle for capturing a managed plugin instance.
 *
 * Exposes an internal symbol-keyed callback that can be spread into
 * plugin configuration without conflicting with native plugin options.
 *
 * The captured instance is available through the `instance` getter
 * after the plugin has been created or reused. Until then, the getter
 * returns `undefined`.
 *
 * The `instance` getter is non-enumerable and is not included when
 * the capture handle is spread into plugin configuration.
 *
 * Each capture handle should be used for a single component mount.
 * Reusing it across mounts overwrites the previously captured instance.
 *
 * Specify `T` explicitly for type-safe access to the captured instance.
 * Without an explicit type argument, the instance is typed as `unknown`.
 *
 * @typeParam T - The expected type of the managed plugin instance.
 *
 * @returns A capture handle containing the instance getter and
 * an internal symbol-keyed capture callback.
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
