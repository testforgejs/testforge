import fs from "node:fs/promises";
import path from "node:path";

import { assertUnique } from "./assert-unique.mjs";
import { discoverPlugins } from "./discover-plugins.mjs";
import { generateSource } from "./generate-source.mjs";

/**
 * Discovers TestForge plugins, validates their registry metadata,
 * and generates the TypeScript plugin registry file.
 *
 * @param {object} options
 * @param {string} options.pluginsDirectory
 * @param {string} options.outputFile
 * @returns {Promise<PluginRegistryEntry[]>}
 */
export async function generatePluginRegistry({ pluginsDirectory, outputFile }) {
  const plugins = await discoverPlugins(pluginsDirectory);

  assertUnique(plugins, "packageName");
  assertUnique(plugins, "displayName");
  assertUnique(plugins, "exportName");

  const source = generateSource(plugins);

  await fs.mkdir(path.dirname(outputFile), {
    recursive: true,
  });

  await fs.writeFile(outputFile, source);

  return plugins;
}
