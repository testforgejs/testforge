#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

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
  "name": "@testforgejs/vue-test-plugin-${kebabName}",
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
    "build": "tsup",
    "dev": "tsup --watch"
  },
  "dependencies": {
    "@testforgejs/vue-test-core": "workspace:*"
  },
  "peerDependencies": {
    // Add library-specific peerDependencies manually if required
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
  `import type { PluginControlOptions } from "@testforgejs/vue-test-core";

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
  `import type {} from "@testforgejs/vue-test-core";
import type { VueTest${pascalName}Options } from "./types";

declare module "@testforgejs/vue-test-core" {
  interface PluginOptionsMap {
    ${camelName}: VueTest${pascalName}Options;
  }
}
`,
);

// 5. src/module/create{Name}Plugin.ts
writeFile(
  `src/module/create${pascalName}Plugin.ts`,
  `import { createPluginInstance } from "@testforgejs/vue-test-core";

import type { VueTest${pascalName}Options } from "../types/types";

/*
 * Factory for creating the plugin instance.
 * Separated to simplify isolated unit testing.
 */
export function create${pascalName}Plugin(
  options: VueTest${pascalName}Options,
): any {
  // TODO: Replace with actual library factory
  // Example:
  // return createPluginInstance(createLibrary, options);

  const fakeConstructor = (opts: any) => ({
    install: () => {},
    ...opts,
  });

  return createPluginInstance<any, VueTest${pascalName}Options>(
    fakeConstructor,
    options,
  );
}
`,
);

// 6. src/module/{Name}Plugin.ts
writeFile(
  `src/module/${camelName}Plugin.ts`,
  `import { create${pascalName}Plugin } from "./create${pascalName}Plugin.js";

import type { PluginModule } from "@testforgejs/vue-test-core";
import type { VueTest${pascalName}Options } from "../types/types";

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
export * from "./types/types";
`,
);

console.log(`✅ Success! Created @testforgejs/vue-test-plugin-${kebabName}`);
console.log(`👉 Location: packages/vue-test-plugin-${kebabName}`);
console.log(`💡 Don't forget to run pnpm install to link workspace dependencies.`);
