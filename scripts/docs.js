import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import readline from "readline/promises";
import { stdin as input, stdout as output } from "process";

const PACKAGES_DIR = path.join(process.cwd(), "packages");
const PREFIX = "vue-test-plugin-";

async function main() {
  // 1. Checking for the presence of the “packages” folder
  if (!fs.existsSync(PACKAGES_DIR)) {
    console.error(`❌ Error: The folder '${PACKAGES_DIR}' was not found.`);
    process.exit(1);
  }

  // 2. Scanning plugins
  const items = fs.readdirSync(PACKAGES_DIR);
  const plugins = items.filter((item) => {
    const fullPath = path.join(PACKAGES_DIR, item);
    return fs.statSync(fullPath).isDirectory() && item.startsWith(PREFIX);
  });

  if (plugins.length === 0) {
    console.log(`ℹ️ No plugins with the prefix '${PREFIX}' were found.`);
    process.exit(0);
  }

  // 3. Check for the presence of the passed argument (for example, “router” or “vue-test-plugin-router”)
  const arg = process.argv[2]?.trim();

  if (arg) {
    // Looking for an exact match (either by full name or by nickname)
    const targetPlugin = plugins.find(
      (plugin) => plugin === arg || plugin.replace(PREFIX, "") === arg,
    );

    if (!targetPlugin) {
      console.error(`❌ Error: The "${arg}" plugin was not found in the packages folder.`);
      console.log(`Available short names: ${plugins.map((p) => p.replace(PREFIX, "")).join(", ")}`);
      process.exit(1);
    }

    runDocsGeneration(targetPlugin);
    return;
  }

  // 4. If no argument is provided, display the interactive menu
  console.log("\nAvailable plugins for generating documentation:");
  plugins.forEach((plugin, index) => {
    const shortName = plugin.replace(PREFIX, "");
    console.log(`  [${index + 1}] ${shortName} (${plugin})`);
  });
  console.log(`  [0] Exit the script\n`);

  const rl = readline.createInterface({ input, output });
  const answer = await rl.question("Enter the plugin number: ");
  rl.close();

  const selectedIndex = parseInt(answer.trim(), 10);

  if (selectedIndex === 0 || isNaN(selectedIndex)) {
    console.log("👋 Exit the script.");
    process.exit(0);
  }

  if (selectedIndex < 1 || selectedIndex > plugins.length) {
    console.error("❌ Invalid number. Please restart the script.");
    process.exit(1);
  }

  runDocsGeneration(plugins[selectedIndex - 1]);
}

// Moved the generation startup into a separate function for DRY
function runDocsGeneration(pluginName) {
  // Find the path to the selected plugin's package.json file
  const packageJsonPath = path.join(PACKAGES_DIR, pluginName, "package.json");

  // Check if `package.json` exists and if it contains the required script
  if (fs.existsSync(packageJsonPath)) {
    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));

    if (!pkg.scripts || !pkg.scripts["docs:generate"]) {
      console.error(
        `\n❌ Error: The "docs:generate" script is not configured in the "${pluginName}" package.`,
      );
      console.log(`💡 Add '"docs:generate": "typedoc"' to ${pluginName}/package.json\n`);
      process.exit(1);
    }
  }

  try {
    console.log(`\n🚀 Generate documentation for the package: ${pluginName}...`);
    execSync(`pnpm --filter ${pluginName} docs:generate`, { stdio: "inherit" });
    console.log("✅ The documentation has been successfully created!");
  } catch {
    console.error("❌ An error occurred during generation.");
    process.exit(1);
  }
}

main();
