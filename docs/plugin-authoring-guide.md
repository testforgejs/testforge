# TestForge Plugin Authoring Guide

Each TestForge plugin is responsible for integrating a specific library (e.g., Router, Pinia) into the unified component mounting pipeline. A plugin must provide strict autocompletion for end-users and an isolated factory for the core runtime.

## Architecture & File Structure

New plugins must strictly adhere to the following directory layout:

```text
packages/vue-test-plugin-custom/
└── src/
    ├── index.ts               # Entry point: exports modules/types, imports augmentation
    ├── module/
    │   ├── customPlugin.ts    # PluginModule definition for the core registry
    │   └── createCustomPlugin.ts # Instance factory (isolated runtime logic)
    └── types/
        ├── types.ts           # Plugin configuration interfaces
        └── augmentation.ts    # Global PluginOptionsMap enhancement
```

## Step-by-Step Implementation

### Step 1: Define Plugin Options (`types/types.ts`)

Declare the plugin options interface. Extend it from both the third-party library's native options and the core `PluginControlOptions<TInstance>`. This automatically hooks up support for the `expose` callback.

```typescript
import type { CustomOptions, CustomInstance } from "some-vue-library";
import type { PluginControlOptions } from "@testforge/vue-test-core";

export interface VueTestCustomOptions extends CustomOptions, PluginControlOptions<CustomInstance> {
  /** Additional test-specific configuration fields (optional) */
  mockApis?: boolean;
}
```

### Step 2: Register via Module Augmentation (`types/augmentation.ts`)

Use Module Augmentation to ensure that both the core framework and the user's IDE recognize the new plugin key and offer autocompletion.

```typescript
import type {} from "@testforge/vue-test-core"; // Enforces ESM module scope for the file
import type { VueTestCustomOptions } from "./types";

declare module "@testforge/vue-test-core" {
  interface PluginOptionsMap {
    // The 'custom' key is the exact property name the user will use in configuration
    custom: VueTestCustomOptions;
  }
}
```

### Step 3: Implement the Isolated Factory (`module/createCustomPlugin.ts`)

Write a dedicated function to initialize the library instance. Leverage the core's built-in `createPluginInstance` helper. It automatically handles reusing cached singletons (`__sharedInstance`) and firing the `expose` callback.

```typescript
import { createPluginInstance } from "@testforge/vue-test-core";
import { createCustomLibraryInstance } from "some-vue-library";

import type { CustomInstance } from "some-vue-library";
import type { VueTestCustomOptions } from "../types/types";
import type { RuntimePluginOptions } from "@testforge/vue-test-core";

export function createCustomPlugin(
  options: RuntimePluginOptions<CustomInstance, VueTestCustomOptions>,
): CustomInstance {
  // Pass the original library constructor and the runtime options object
  const instance = createPluginInstance<CustomInstance, VueTestCustomOptions>(
    createCustomLibraryInstance,
    options,
  );

  // Apply test-specific runtime mutations (e.g., setting up mocks)
  if (!options.__sharedInstance && options.mockApis) {
    instance.setupMocks();
  }

  return instance;
}
```

### Step 4: Define the Plugin Module (`module/customPlugin.ts`)

Assemble the plugin module implementing the `PluginModule` interface. The string returned by `getName()` must **match exactly** with the property key registered in `PluginOptionsMap` during Step 2.

```typescript
import { createCustomPlugin } from "./createCustomPlugin.js";

import type { CustomInstance } from "some-vue-library";
import type { VueTestCustomOptions } from "../types/types";
import type { PluginModule } from "@testforge/vue-test-core";

export const customPlugin: PluginModule<CustomInstance, VueTestCustomOptions> = {
  getName: () => "custom", // Must match the key in PluginOptionsMap exactly

  getDefinition: () => ({
    // Mandatory instance creation hook
    create: createCustomPlugin,

    // Optional lifecycle hooks for pipeline integration:
    // beforeCreate(ctx, options) { return options; },
    // afterCreate(instance, ctx) {}
  }),
};
```

### Step 5: Export Publicly (`index.ts`)

Import the augmentation file to guarantee it is bundled into the final `.d.ts` declaration graph, then export your plugin module.

```typescript
// Mandatory import to ensure type augmentation rolls out to the user
import "./types/augmentation.js";

export { customPlugin } from "./module/customPlugin.js";
export * from "./types/types.js";
```

## Plugin Checklist

1. **Name Alignment:** The string returned by `getName()` is identical to the property key inside `interface PluginOptionsMap` in `augmentation.ts`.
2. **Type Side-Effects Exported:** The main `index.ts` contains an explicit `import "./types/augmentation.js"`.
3. **Isolated Side-Effects:** Instance creation logic is completely encapsulated within the `create*.ts` file, keeping the factory testable independently from the core registry.
4. **Safe Singleton Re-runs:** All secondary runtime modifications (like setting active instances or store mocking) are wrapped inside an `if (!options.__sharedInstance)` block.
