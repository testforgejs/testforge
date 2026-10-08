import type { PluginName, PluginDefinition, PluginInstanceName } from "../../../types";

/*
 * Checks whether a plugin supports instance references.
 *
 * Narrows the plugin name to PluginInstanceName when the definition
 * explicitly declares support for instance references.
 */
export function supportsPluginInstanceReferences(
  name: PluginName,
  definition: PluginDefinition,
): name is PluginInstanceName {
  return definition.supportsInstanceReferences === true;
}
