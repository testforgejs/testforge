import type { ExposeOption } from "../../types.ts";

/*
Passes the created plugin instance to the `expose` callback
if it is provided in plugin options.

This allows tests to capture plugin instances that are created
internally by the test plugin factory.
*/
export function exposeInstance<T>(instance: T, options?: ExposeOption<T>): void {
  if (typeof options?.expose === "function") {
    options.expose(instance);
  }
}
