import { PLUGIN_INSTANCE_REFERENCE_TYPE } from "../../types";
import type { PluginInstanceName, PluginInstanceReference } from "../../types";

/*
 * Checks whether a value is a deferred plugin instance reference.
 *
 * Validates the runtime descriptor shape used by `fromPluginInstance`.
 */
export function isPluginInstanceReference(
  value: unknown,
): value is PluginInstanceReference<PluginInstanceName, unknown> {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const reference = value as {
    __type?: unknown;
    pluginName?: unknown;
    resolve?: unknown;
  };

  return (
    reference.__type === PLUGIN_INSTANCE_REFERENCE_TYPE &&
    typeof reference.pluginName === "string" &&
    typeof reference.resolve === "function"
  );
}
