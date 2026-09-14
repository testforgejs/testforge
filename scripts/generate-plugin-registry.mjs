import path from "node:path";
import { fileURLToPath } from "node:url";

import { generatePluginRegistry } from "./plugin-registry/registry-generator.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, "..");
const PLUGINS_DIR = path.join(ROOT_DIR, "packages");
const OUTPUT_FILE = path.join(ROOT_DIR, "packages/cli/src/generated/plugin-registry.ts");

async function main() {
  const plugins = await generatePluginRegistry({
    pluginsDirectory: PLUGINS_DIR,
    outputFile: OUTPUT_FILE,
  });

  console.log(`Generated plugin registry with ${plugins.length} plugins:`);

  for (const plugin of plugins) {
    console.log(`  - ${plugin.packageName}`);
  }

  console.log(`\nOutput: ${path.relative(ROOT_DIR, OUTPUT_FILE)}`);
}

main().catch((error) => {
  console.error(`\nFailed to generate plugin registry:\n`);
  console.error(error.message);
  process.exit(1);
});
