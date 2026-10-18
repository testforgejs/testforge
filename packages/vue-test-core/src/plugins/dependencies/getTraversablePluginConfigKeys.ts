import { OPAQUE_PLUGIN_CONFIG_KEY_SET } from "../../constants/constants.js";

/*
 * Returns traversable keys of a plugin configuration object.
 *
 * Includes own enumerable string and symbol keys.
 * Excludes non-enumerable properties and internal opaque keys
 * whose values must not be traversed.
 */
export function getTraversablePluginConfigKeys(config: object): PropertyKey[] {
  return Reflect.ownKeys(config).filter(
    (key) =>
      Object.prototype.propertyIsEnumerable.call(config, key) &&
      !OPAQUE_PLUGIN_CONFIG_KEY_SET.has(key),
  );
}
