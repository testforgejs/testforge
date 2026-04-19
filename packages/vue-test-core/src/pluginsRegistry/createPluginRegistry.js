/**
 * Creates a plugin registry from a manifest array.
 *
 * @template {PluginDefinition<any, any>} T
 * @param {PluginManifestEntry[]} manifest
 * @returns {PluginRegistry<T>}
 */
export function createPluginRegistry(manifest = []) {
  const map = new Map();

  /**
   * Registers a single plugin from a manifest entry.
   * @param {PluginManifestEntry} entry
   */
  const register = (entry) => {
    const { module } = entry;

    if (!module) return; // Protection against empty records

    const name = module.getName();
    const factory = module.getDefinition();
    map.set(name, factory);
  };

  // Initialize the registry from the manifest
  manifest.forEach(register);

  /** @type {PluginRegistry<T>} */
  return {
    /** @type {{function(PluginModule): void}} */
    register,
    get: (name) => map.get(name),
    has: (name) => map.has(name),
    entries: () => map.entries(),
    getNames: () => Array.from(map.keys()),
  };
}
