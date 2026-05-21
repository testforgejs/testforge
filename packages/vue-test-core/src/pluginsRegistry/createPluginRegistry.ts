import type { PluginManifestEntry, PluginRegistry, PluginDefinition, PluginName } from "../types";

/*
 * Creates a runtime registry for resolving plugin definitions by name.
 *
 * Converts plugin manifest entries into an indexed lookup structure
 * used during pipeline and plugin initialization.
 */
export function createPluginRegistry(manifest: PluginManifestEntry[] = []): PluginRegistry {
  const map = new Map<PluginName, PluginDefinition<any, any>>();

  const register = (entry: PluginManifestEntry): void => {
    const { module } = entry;
    if (!module) return;

    const name = module.getName();
    const definition = module.getDefinition();
    map.set(name, definition);
  };

  manifest.forEach(register);

  return {
    register,
    get: (name) => map.get(name),
    has: (name) => map.has(name),
    entries: () => map.entries(),
    getNames: () => Array.from(map.keys()),
  };
}
