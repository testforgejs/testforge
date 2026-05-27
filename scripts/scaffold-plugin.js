#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Get the plugin name from the CLI arguments
const pluginName = process.argv[2];

if (!pluginName) {
  console.error("❌ Please provide a plugin name (e.g., pnpm scaffold-plugin my-plugin)");
  process.exit(1);
}

// Formatting names
const kebabName = pluginName.toLowerCase().replace(/[^a-z0-9-]/g, "-");
const pascalName = kebabName
  .split("-")
  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
  .join("");
const camelName = pascalName.charAt(0).toLowerCase() + pascalName.slice(1);

const targetDir = path.resolve(process.cwd(), `packages/vue-test-plugin-${kebabName}`);

if (fs.existsSync(targetDir)) {
  console.error(`❌ Plugin directory already exists: packages/vue-test-plugin-${kebabName}`);
  process.exit(1);
}

// A utility for creating files
const writeFile = (filePath, content) => {
  const fullPath = path.join(targetDir, filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + "\n");
};

console.log(`🚀 Scaffolding new TestForge plugin: vue-test-plugin-${kebabName}...`);

// 1. package.json
writeFile(
  "package.json",
  `{
  "name": "@testforge/vue-test-plugin-${kebabName}",
  "version": "1.0.0",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
  },
  "files": [
    "dist"
  ],
  "scripts": {
    "build": "tsup"
  },
  "dependencies": {
    "@testforge/vue-test-core": "workspace:*"
  },
  "peerDependencies": {
    "vue": "^3.0.0"
  }
}`,
);

// 2. tsconfig.json
writeFile(
  "tsup.config.js",
  `import { defineConfig } from "tsup";
import baseConfig from "../../tsup.config.base.js";

export default defineConfig({
  ...baseConfig,
});`,
);

// 3. src/types/types.ts
writeFile(
  "src/types/types.ts",
  `import type { PluginControlOptions } from "@testforge/vue-test-core";

// TODO: Replace 'any' with original library types (e.g., CustomOptions, CustomInstance)
export interface VueTest${pascalName}Options extends Record<string, any>, PluginControlOptions<any> {
  /** Example custom flag for test environment */
  mockData?: boolean;
}
`,
);

// 4. src/types/augmentation.ts
writeFile(
  "src/types/augmentation.ts",
  `import type {} from "@testforge/vue-test-core";
import type { VueTest${pascalName}Options } from "./types.js";

declare module "@testforge/vue-test-core" {
  interface PluginOptionsMap {
    ${camelName}: VueTest${pascalName}Options;
  }
}
`,
);

// 5. src/module/create{Name}Plugin.ts
writeFile(
  `src/module/create${pascalName}Plugin.ts`,
  `import { createPluginInstance } from "@testforge/vue-test-core";

import type { RuntimePluginOptions } from "@testforge/vue-test-core";
import type { VueTest${pascalName}Options } from "../types/types.js";

/*
 * Factory for creating the plugin instance.
 * Separated to simplify isolated unit testing.
 */
export function create${pascalName}Plugin(
  options: RuntimePluginOptions<any, VueTest${pascalName}Options>,
): any {
  // TODO: Replace line below with actual library factory (e.g., createPluginInstance(createLibrary, options))
  const fakeConstructor = (opts: any) => ({ install: () => {}, ...opts });
  
  const instance = createPluginInstance<any, VueTest${pascalName}Options>(fakeConstructor, options);

  if (!options.__sharedInstance && options.mockData) {
    // Apply runtime modifications here
  }

  return instance;
}
`,
);

// 6. src/module/{Name}Plugin.ts
writeFile(
  `src/module/${camelName}Plugin.ts`,
  `import { create${pascalName}Plugin } from "./create${pascalName}Plugin.js";

import type { PluginModule } from "@testforge/vue-test-core";
import type { VueTest${pascalName}Options } from "../types/types.js";

export const ${camelName}Plugin: PluginModule<any, VueTest${pascalName}Options> = {
  getName: () => "${camelName}",

  getDefinition: () => ({
    create: create${pascalName}Plugin,
    // beforeCreate(ctx, options) { return options; },
    // afterCreate(instance, ctx) {}
  }),
};
`,
);

// 7. src/index.ts
writeFile(
  "src/index.ts",
  `import "./types/augmentation.js";

export { ${camelName}Plugin } from "./module/${camelName}Plugin.js";
export * from "./types/types.js";
`,
);

console.log(`✅ Success! Created @testforge/vue-test-plugin-${kebabName}`);
console.log(`👉 Location: packages/vue-test-plugin-${kebabName}`);
console.log(`💡 Don't forget to run pnpm install to link workspace dependencies.`);
