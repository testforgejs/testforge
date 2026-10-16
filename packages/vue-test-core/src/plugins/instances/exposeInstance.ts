import { PLUGIN_EXPOSE } from "../../constants/constants.js";

import type { ExposeOption } from "../../types";

/*
 * Passes the created plugin instance to the internal
 * capture callback when one is provided.
 */
export function exposeInstance<T>(instance: T, options?: ExposeOption<T>): void {
  const expose = options?.[PLUGIN_EXPOSE];

  if (typeof expose === "function") {
    expose(instance);
  }
}
