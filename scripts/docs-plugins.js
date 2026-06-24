import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import readline from "readline";
import { stdin as input, stdout as output } from "process";

const PACKAGES_DIR = path.join(process.cwd(), "packages");
const PREFIX = "vue-test-plugin-";

async function main() {
  // 1. Checking for the presence of the "packages" folder
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

  // 3. Checking for the presence of a CLI argument (navigating through the menu)
  const arg = process.argv[2]?.trim();

  if (arg) {
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

  // 4. Interactive selection in the Changeset style
  const selectedPlugin = await selectPluginInteractive(plugins);
  if (selectedPlugin) {
    runDocsGeneration(selectedPlugin);
  } else {
    console.log("👋 Exit the script.");
    process.exit(0);
  }
}

/*
 * Interactive plugin selection menu using arrows
 */
function selectPluginInteractive(plugins) {
  return new Promise((resolve) => {
    let cursor = 0;

    // Prepare a list of options (add an exit point)
    const choices = [
      ...plugins.map((p) => ({ name: p.replace(PREFIX, ""), value: p })),
      { name: "Exit the script", value: null },
    ];

    // Menu rendering function in the console
    const render = () => {
      // Clear the previous menu output
      output.write("\x1Bc");
      output.write("\nAvailable plugins for generating documentation:\n");
      output.write("Use (↑ / ↓) to navigate, (Enter) to select\n\n");

      choices.forEach((choice, index) => {
        if (index === cursor) {
          // Highlight the selected item with a blue arrow
          output.write(` \x1b[36m❯\x1b[0m \x1b[36m${choice.name}\x1b[0m\n`);
        } else {
          output.write(`   ${choice.name}\n`);
        }
      });
      output.write("\n");
    };

    // Initialize raw mode for key interception
    readline.emitKeypressEvents(input);
    if (input.isTTY) {
      input.setRawMode(true);
    }
    input.resume();

    render();

    // Keyboard press listener
    const onKeypress = (str, key) => {
      // Support for Ctrl+C to exit immediately
      if (key.ctrl && key.name === "c") {
        cleanup();
        process.exit(0);
      }

      if (key.name === "up") {
        cursor = cursor === 0 ? choices.length - 1 : cursor - 1;
        render();
      } else if (key.name === "down") {
        cursor = cursor === choices.length - 1 ? 0 : cursor + 1;
        render();
      } else if (key.name === "return") {
        cleanup();
        resolve(choices[cursor].value);
      }
    };

    // Clearing input streams after selection
    const cleanup = () => {
      input.removeListener("keypress", onKeypress);
      if (input.isTTY) {
        input.setRawMode(false);
      }
      input.pause();
    };

    input.on("keypress", onKeypress);
  });
}

function runDocsGeneration(pluginName) {
  const packageJsonPath = path.join(PACKAGES_DIR, pluginName, "package.json");

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
