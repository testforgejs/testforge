import { ERROR_PREFIX } from "../../constants/constants.js";
import { isPlainObject } from "../../guards/isPlainObject.js";
import { isPluginInstanceReference } from "./isPluginInstanceReference.js";

import type {
  PluginInstanceMap,
  PluginInstanceName,
  PluginName,
  PluginInstanceReference,
} from "../../types";

/*
 * Resolves deferred plugin instance references in a runtime configuration value.
 *
 * Arrays and plain objects are traversed recursively and cloned without mutating
 * the original configuration. Non-plain objects are treated as opaque values.
 *
 * Shared references and cyclic structures are preserved through WeakMap-based
 * clone tracking.
 *
 * Each PluginInstanceReference is resolved against a plugin that must already
 * exist in the created plugin registry.
 */
export function resolvePluginInstanceReferences<T>(
  value: T,
  createdPlugins: ReadonlyMap<PluginName, unknown>,
): T {
  const resolved = new WeakMap<object, unknown>();

  const visit = (current: unknown): unknown => {
    if (isPluginInstanceReference(current)) {
      return resolveReference(current, createdPlugins);
    }

    if (Array.isArray(current)) {
      const existing = resolved.get(current);

      if (existing !== undefined) {
        return existing;
      }

      const result: unknown[] = [];

      resolved.set(current, result);

      current.forEach((item) => {
        result.push(visit(item));
      });

      return result;
    }

    if (!isPlainObject(current)) {
      return current;
    }

    const existing = resolved.get(current);

    if (existing !== undefined) {
      return existing;
    }

    const result = Object.create(Object.getPrototypeOf(current)) as Record<string, unknown>;

    resolved.set(current, result);

    Object.entries(current).forEach(([key, item]) => {
      result[key] = visit(item);
    });

    return result;
  };

  return visit(value) as T;
}

/*
 * Resolves a single deferred reference against an already created plugin instance.
 */
function resolveReference<TPluginName extends PluginInstanceName>(
  reference: PluginInstanceReference<TPluginName, unknown>,
  createdPlugins: ReadonlyMap<PluginName, unknown>,
): unknown {
  if (!createdPlugins.has(reference.pluginName)) {
    throw new Error(
      `${ERROR_PREFIX} Cannot resolve plugin instance reference "${reference.pluginName}" before the plugin has been created.`,
    );
  }

  const instance = createdPlugins.get(reference.pluginName) as PluginInstanceMap[TPluginName];

  return reference.resolve(instance);
}
