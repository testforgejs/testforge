import { exposeInstance } from "../helpers/exposeInstance.js";

/**
 * Creates (or reuses) a plugin instance using the provided factory.
 *
 * If `options.__sharedInstance` is present, the factory is NOT called
 * and the shared instance is reused instead. This is primarily used
 * in test environments to avoid recreating the same plugin instance
 * across multiple mounts.
 *
 * After instance creation (or reuse), the instance is passed to
 * {@link exposeInstance} to allow tests to capture it via
 * the optional `options.expose` callback.
 *
 * @param {function(object): any} factory - Plugin factory function.
 * @param {object} options - Plugin options.
 * @param {any} [options.__sharedInstance] - Pre-created instance to reuse.
 * @param {function(any): void} [options.expose] - Optional callback to receive the instance.
 *
 * @returns {any} The created or reused plugin instance.
 */
export function createPluginInstance(factory, options) {
  const instance = options.__sharedInstance || factory(options);
  exposeInstance(instance, options);

  return instance;
}
