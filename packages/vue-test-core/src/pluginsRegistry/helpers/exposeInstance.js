/**
 * Passes the created plugin instance to the `expose` callback
 * if it is provided in plugin options.
 *
 * This allows tests to capture plugin instances that are created
 * internally by the test plugin factory.
 *
 * @param {any} instance
 * @param {{ expose?: function(instance:any): void }} options
 */
export function exposeInstance(instance, options) {
  if (typeof options?.expose === "function") {
    options.expose(instance);
  }
}
