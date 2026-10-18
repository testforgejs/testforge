import { getTraversablePluginConfigKeys } from "./getTraversablePluginConfigKeys.js";
import { isPlainObject } from "../../guards/isPlainObject.js";
import { isPluginInstanceReference } from "./isPluginInstanceReference.js";

import type { PluginInstanceName, PluginName } from "../../types";
import type { PluginDependency } from "./types";

/**
 * Collects runtime instance dependencies declared in a plugin's effective
 * configuration.
 *
 * Plugin instance references are treated as atomic descriptors. Arrays and
 * plain objects are traversed recursively, while other object types are left
 * untouched.
 *
 * Configuration values stored under opaque plugin config keys are treated as
 * runtime values and are not traversed. This includes pre-created plugin
 * instances stored under the internal shared-instance symbol.
 *
 * Duplicate references to the same plugin produce a single dependency.
 *
 * @param pluginName - Name of the plugin whose configuration is being scanned.
 * @param config - Fully resolved effective plugin configuration.
 *
 * @returns The unique plugin instance dependencies declared by the configuration.
 */
export function collectPluginDependencies<TPluginName extends PluginName>(
  pluginName: TPluginName,
  config: unknown,
): readonly PluginDependency<TPluginName>[] {
  const dependencyNames = new Set<PluginInstanceName>();
  const visited = new WeakSet<object>();

  const visit = (value: unknown): void => {
    if (isPluginInstanceReference(value)) {
      dependencyNames.add(value.pluginName);
      return;
    }

    if (Array.isArray(value)) {
      if (visited.has(value)) {
        return;
      }

      visited.add(value);
      value.forEach(visit);

      return;
    }

    if (!isPlainObject(value)) {
      return;
    }

    if (visited.has(value)) {
      return;
    }

    visited.add(value);

    const configObject = value as Record<PropertyKey, unknown>;

    for (const key of getTraversablePluginConfigKeys(configObject)) {
      visit(configObject[key]);
    }
  };

  visit(config);

  return Object.freeze(
    [...dependencyNames].map((dependsOn) =>
      Object.freeze({
        pluginName,
        dependsOn,
      }),
    ),
  );
}
