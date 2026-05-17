import type { PluginFactoryOptions } from "../../types.ts";

import { exposeInstance } from "../helpers/exposeInstance.js";

/*
Creates (or reuses) a plugin instance using the provided factory.

If `options.__sharedInstance` is present, the factory is NOT called
and the shared instance is reused instead. This is primarily used
in test environments to avoid recreating the same plugin instance
across multiple mounts.

After instance creation (or reuse), the instance is passed to
{@link exposeInstance} to allow tests to capture it via
the optional `options.expose` callback.

*/
export function createPluginInstance<T>(
  factory: (options: PluginFactoryOptions<T>) => T,
  options: PluginFactoryOptions<T>,
): T {
  const instance = options.__sharedInstance ?? factory(options);
  exposeInstance<T>(instance, options);
  return instance;
}
