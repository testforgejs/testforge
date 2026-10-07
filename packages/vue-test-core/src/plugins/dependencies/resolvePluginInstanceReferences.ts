import { ERROR_PREFIX, OPAQUE_PLUGIN_CONFIG_KEY_SET } from "../../constants/constants.js";
import { isPlainObject } from "../../guards/isPlainObject.js";
import { isPluginInstanceReference } from "./isPluginInstanceReference.js";

import type {
  PluginInstanceMap,
  PluginInstanceName,
  PluginInstanceReference,
  PluginName,
} from "../../types";

/*
 * Resolves deferred plugin instance references within a mount-scoped
 * runtime configuration.
 *
 * Arrays and plain configuration objects are traversed recursively.
 * Branches containing resolved references are copied lazily, while
 * unchanged branches preserve their original identity.
 *
 * The source configuration is never mutated.
 *
 * Non-plain objects and values stored under opaque plugin config keys are
 * treated as runtime values and are not traversed. Shared object references
 * are preserved through WeakMap-based resolution tracking.
 *
 * If the root value itself is a PluginInstanceReference, its resolved
 * value is returned directly.
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

    if (current === null || typeof current !== "object") {
      return current;
    }

    if (Array.isArray(current)) {
      if (resolved.has(current)) {
        return resolved.get(current);
      }

      let result: unknown[] | undefined;

      for (const [index, item] of current.entries()) {
        const resolvedItem = visit(item);

        if (resolvedItem === item) {
          continue;
        }

        if (result === undefined) {
          const clone = current.slice();

          clone[index] = resolvedItem;
          result = clone;

          continue;
        }

        result[index] = resolvedItem;
      }

      const resolvedArray = result ?? current;

      resolved.set(current, resolvedArray);

      return resolvedArray;
    }

    if (!isPlainObject(current)) {
      return current;
    }

    if (resolved.has(current)) {
      return resolved.get(current);
    }

    let result: Record<string, unknown> | undefined;

    for (const [key, item] of Object.entries(current)) {
      if (OPAQUE_PLUGIN_CONFIG_KEY_SET.has(key)) {
        continue;
      }

      const resolvedItem = visit(item);

      if (resolvedItem === item) {
        continue;
      }

      if (result === undefined) {
        const clone = Object.assign(
          Object.create(Object.getPrototypeOf(current)) as Record<string, unknown>,
          current,
        );

        clone[key] = resolvedItem;
        result = clone;

        continue;
      }

      result[key] = resolvedItem;
    }

    const resolvedObject = result ?? current;

    resolved.set(current, resolvedObject);

    return resolvedObject;
  };

  return visit(value) as T;
}

/*
 * Resolves a single deferred reference against an already created plugin instance.
 */
function resolveReference<TPluginName extends PluginInstanceName>(
  reference: PluginInstanceReference<TPluginName, unknown>,
  createdPluginInstances: ReadonlyMap<PluginName, unknown>,
): unknown {
  if (!createdPluginInstances.has(reference.pluginName)) {
    throw new Error(
      `${ERROR_PREFIX} Cannot resolve plugin instance reference "${reference.pluginName}" before the plugin has been created.`,
    );
  }

  const instance = createdPluginInstances.get(
    reference.pluginName,
  ) as PluginInstanceMap[TPluginName];

  return reference.resolve(instance);
}
