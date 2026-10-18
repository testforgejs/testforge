import { ERROR_PREFIX } from "../../constants/constants.js";
import { isPlainObject } from "../../guards/isPlainObject.js";
import { isPluginInstanceReference } from "./isPluginInstanceReference.js";
import { getTraversablePluginConfigKeys } from "./getTraversablePluginConfigKeys.js";

import type { PluginInstanceMap, PluginInstanceName, PluginInstanceReference } from "../../types";

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
 * treated as runtime values and are not traversed.
 *
 * Shared object references are preserved through WeakMap-based resolution
 * tracking. Circular references between traversable configuration objects
 * are rejected.
 *
 * If the root value itself is a PluginInstanceReference, its resolved
 * value is returned directly.
 *
 * @throws When a circular configuration reference is detected or a
 * referenced plugin instance has not been created.
 */
export function resolvePluginInstanceReferences<T>(
  value: T,
  createdPlugins: ReadonlyMap<PluginInstanceName, unknown>,
): T {
  const resolved = new WeakMap<object, unknown>();
  const visiting = new WeakSet<object>();

  const visit = (current: unknown): unknown => {
    if (isPluginInstanceReference(current)) {
      return resolveReference(current, createdPlugins);
    }

    if (current === null || typeof current !== "object") {
      return current;
    }

    // Only arrays and plain objects are traversed.
    if (!Array.isArray(current) && !isPlainObject(current)) {
      return current;
    }

    // Detect cycles in the current traversal path.
    if (visiting.has(current)) {
      throw new Error(`${ERROR_PREFIX} Circular plugin configuration reference detected.`);
    }

    // Reuse already resolved objects to preserve shared references.
    if (resolved.has(current)) {
      return resolved.get(current);
    }

    visiting.add(current);

    try {
      if (Array.isArray(current)) {
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

      const configObject = current as Record<PropertyKey, unknown>;

      let result: Record<PropertyKey, unknown> | undefined;

      for (const key of getTraversablePluginConfigKeys(configObject)) {
        const item = configObject[key];
        const resolvedItem = visit(item);

        if (resolvedItem === item) {
          continue;
        }

        if (result === undefined) {
          const clone = Object.assign(
            Object.create(Object.getPrototypeOf(current)) as Record<PropertyKey, unknown>,
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
    } finally {
      visiting.delete(current);
    }
  };

  return visit(value) as T;
}

/*
 * Resolves a single deferred reference against an already created plugin instance.
 */
function resolveReference<TPluginName extends PluginInstanceName>(
  reference: PluginInstanceReference<TPluginName, unknown>,
  createdPluginInstances: ReadonlyMap<PluginInstanceName, unknown>,
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
