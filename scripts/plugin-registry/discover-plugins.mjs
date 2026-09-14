import fs from "node:fs/promises";
import path from "node:path";

import { readJson } from "./read-json.mjs";
import { validatePluginMetadata } from "./validate-plugin-metadata.mjs";

const PLUGIN_DIRECTORY_PREFIX = "vue-test-plugin-";

/**
 * Discovers TestForge plugins from package directories and returns their
 * validated registry entries.
 *
 * @param {string} pluginsDirectory
 * @returns {Promise<PluginRegistryEntry[]>}
 */
export async function discoverPlugins(pluginsDirectory) {
  const entries = await fs.readdir(pluginsDirectory, {
    withFileTypes: true,
  });

  const pluginDirectories = entries
    .filter((entry) => entry.isDirectory() && entry.name.startsWith(PLUGIN_DIRECTORY_PREFIX))
    .sort((a, b) => a.name.localeCompare(b.name));

  const plugins = [];

  for (const entry of pluginDirectories) {
    const packagePath = path.join(pluginsDirectory, entry.name, "package.json");

    const packageJson = await readJson(packagePath);

    plugins.push(validatePluginMetadata(packageJson, packagePath));
  }

  return plugins;
}
