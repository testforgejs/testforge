#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

// Generate a factory-based TestForge plugin with a managed instance.
const pluginName = process.argv[2];

if (!pluginName) {
  console.error("❌ Please provide a plugin name (e.g., pnpm scaffold-plugin my-plugin)");
  process.exit(1);
}

const kebabName = pluginName
  .trim()
  .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "");

if (!/^[a-z]/.test(kebabName)) {
  console.error("❌ Plugin name must start with a letter.");
  process.exit(1);
}

const pascalName = kebabName
  .split("-")
  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
  .join("");
const camelName = pascalName.charAt(0).toLowerCase() + pascalName.slice(1);
const constantName = `${kebabName.toUpperCase().replace(/-/g, "_")}_PLUGIN_NAME`;
const packageName = `@testforgejs/vue-test-plugin-${kebabName}`;
const targetDir = path.resolve(process.cwd(), `packages/vue-test-plugin-${kebabName}`);

if (fs.existsSync(targetDir)) {
  console.error(`❌ Plugin directory already exists: ${targetDir}`);
  process.exit(1);
}

const writeFile = (relativePath, content) => {
  const filePath = path.join(targetDir, relativePath);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${content.trim()}\n`);
};

console.log(`🚀 Scaffolding new TestForge plugin: ${packageName}...`);

// 1. Package metadata (valid JSON; add library peer dependencies as needed).
writeFile(
  "package.json",
  JSON.stringify(
    {
      name: packageName,
      version: "1.0.0",
      type: "module",
      main: "./dist/index.cjs",
      module: "./dist/index.js",
      types: "./dist/index.d.ts",
      exports: {
        ".": {
          types: "./dist/index.d.ts",
          import: "./dist/index.js",
          require: "./dist/index.cjs",
        },
      },
      files: ["dist"],
      scripts: {
        build: "tsup",
        dev: "tsup --watch",
      },
      dependencies: {
        "@testforgejs/vue-test-core": "workspace:*",
      },
      peerDependencies: {},
    },
    null,
    2,
  ),
);

// 2. Build configuration.
writeFile(
  "tsup.config.js",
  `import { defineConfig } from "tsup";
import baseConfig from "../../tsup.config.base.js";

export default defineConfig({
  ...baseConfig,
});`,
);

// 3. Plugin identifier.
writeFile("src/constants/constants.ts", `export const ${constantName} = "${camelName}" as const;`);

// 4. Public options, managed instance, and internal runtime options.
writeFile(
  "src/types/types.ts",
  `import type { RuntimePluginOptions } from "@testforgejs/vue-test-core";

/**
 * Managed plugin instance.
 * TODO: Replace with the runtime instance type from the integrated library.
 */
export interface ${pascalName}Instance {
  install(): void;
}

/**
 * Public plugin configuration.
 * TODO: Replace with native library options and TestForge-specific settings.
 * Instance controls are provided automatically through PluginInstanceMap.
 */
export interface VueTest${pascalName}Options {
  mockData?: boolean;
}

/**
 * Internal runtime options used by the managed plugin factory.
 * The Mount Pipeline resolves withPluginInstance() metadata before this stage.
 * @internal
 */
export type ${pascalName}RuntimeOptions = RuntimePluginOptions<
  ${pascalName}Instance,
  VueTest${pascalName}Options
>;`,
);

// 5. Type registration: options and managed instance capability.
writeFile(
  "src/types/augmentation.ts",
  `import { ${constantName} } from "../constants/constants.js";

import type {} from "@testforgejs/vue-test-core";
import type { ${pascalName}Instance, VueTest${pascalName}Options } from "./types.js";

/** Registers the plugin configuration and its managed instance type. */
declare module "@testforgejs/vue-test-core" {
  interface PluginOptionsMap {
    [${constantName}]: VueTest${pascalName}Options;
  }

  // Enables captureInstance(), withPluginInstance(), and fromPluginInstance().
  interface PluginInstanceMap {
    [${constantName}]: ${pascalName}Instance;
  }
}`,
);

// 6. Managed instance factory.
writeFile(
  `src/module/create${pascalName}Plugin.ts`,
  `import { createPluginInstance } from "@testforgejs/vue-test-core";

import type {
  ${pascalName}Instance,
  ${pascalName}RuntimeOptions,
  VueTest${pascalName}Options,
} from "../types/types.js";

/**
 * TODO: Replace this placeholder with the integrated library's native factory.
 * The return value must be a Vue-installable plugin instance.
 */
function createNativeInstance(_options: VueTest${pascalName}Options): ${pascalName}Instance {
  return {
    install() {},
  };
}

/** Creates or reuses a managed plugin instance. */
export function create${pascalName}Plugin(
  options: ${pascalName}RuntimeOptions,
): ${pascalName}Instance {
  return createPluginInstance<${pascalName}Instance, VueTest${pascalName}Options>(
    createNativeInstance,
    options,
  );
}`,
);

// 7. Preset defaults. Add only project-independent native configuration.
writeFile(
  "src/defaults.ts",
  `import type { PluginDefaultOptionsFactory } from "@testforgejs/vue-test-core";
import type { VueTest${pascalName}Options } from "./types/types.js";

export const defaultOptions: PluginDefaultOptionsFactory<
  VueTest${pascalName}Options
> = () => () => ({
  // TODO: Add minimal project-independent native defaults if needed.
});`,
);

// 8. Plugin module.
writeFile(
  `src/module/${camelName}Plugin.ts`,
  `import { ${constantName} } from "../constants/constants.js";
import { defaultOptions } from "../defaults.js";
import { create${pascalName}Plugin } from "./create${pascalName}Plugin.js";

import type { PluginModule } from "@testforgejs/vue-test-core";
import type {
  ${pascalName}Instance,
  VueTest${pascalName}Options,
} from "../types/types.js";

export const ${camelName}Plugin: PluginModule<
  ${pascalName}Instance,
  VueTest${pascalName}Options
> = {
  getName: () => ${constantName},

  getDefinition: () => ({
    create: create${pascalName}Plugin,
    supportsInstanceReferences: true,

    // beforeCreate(ctx, options) {
    //   return options;
    // },
    // afterCreate(instance, ctx) {},
  }),

  getDefaultOptions: defaultOptions,
};`,
);

// 9. Public entry point. Importing augmentation enables module merging.
writeFile(
  "src/index.ts",
  `import "./types/augmentation.js";

export {
  ${camelName}Plugin,
  ${camelName}Plugin as plugin,
} from "./module/${camelName}Plugin.js";

export { ${constantName} as PLUGIN_NAME } from "./constants/constants.js";

export * from "./types/types.js";`,
);

console.log(`✅ Success! Created ${packageName}`);
console.log(`👉 Location: packages/vue-test-plugin-${kebabName}`);
console.log("💡 Replace the placeholder instance and factory with the native library API.");
console.log("💡 Add library peerDependencies as needed, then run pnpm install.");
