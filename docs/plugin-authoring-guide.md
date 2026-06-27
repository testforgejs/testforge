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

---

## Step-by-Step Implementation

### Step 1: Define Plugin Options (`types/types.ts`)

Declare the plugin options interface. Extend it from both the third-party library's native options and the core `PluginControlOptions<TInstance>`. This automatically hooks up support for the `expose` callback.

### What is TInstance?

`TInstance` represents the runtime plugin instance created by your plugin factory.

This is the object that TestForge eventually passes to Vue Test Utils
via `global.plugins` during component mounting.

Examples:

- Pinia → `Pinia`
- Router → `Router`
- I18n → `I18n`
- Vuetify → `ReturnType<typeof createVuetify>`

Recommended method for getting the instance type:

```typescript
// Library exports instance type
import type { Router } from "vue-router";

// Library exports factory only
import { createVuetify } from "vuetify";

type VuetifyInstance = ReturnType<typeof createVuetify>;
```

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

export function createCustomPlugin(options: VueTestCustomOptions): CustomInstance {
  // Pass the original library constructor and the runtime options object
  return createPluginInstance<CustomInstance, VueTestCustomOptions>(
    createCustomLibraryInstance,
    options,
  );
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

The `beforeCreate` and `afterCreate` hooks are optional.

Most plugins only need:

getDefinition: () => ({ create })

### Step 5: Export Publicly (`index.ts`)

Import the augmentation file to guarantee it is bundled into the final `.d.ts` declaration graph, then export your plugin module.

```typescript
// Mandatory import to ensure type augmentation rolls out to the user
import "./types/augmentation.js";

export { customPlugin } from "./module/customPlugin.js";
export * from "./types/types";
```

## Plugin Lifecycle

A TestForge plugin may participate in three lifecycle stages:

```text
User options
    ↓
beforeCreate(ctx, options)
    ↓
create(options)
    ↓
afterCreate(instance, ctx)
```

`beforeCreate(ctx, options)`
Executed before the plugin instance is created.

Typical use cases:

- inject defaults from the active preset
- normalize user configuration
- derive runtime values from pipeline state
- modify options based on other enabled plugins

Must return the final options object that will be passed to `create()`.

```typescript
beforeCreate(ctx, options) {
  return {
    ...options,
    legacyMode: false,
  };
}
```

---

`create(options)`

Responsible for creating the actual Vue plugin instance.

This hook is mandatory.

```typescript
create: createCustomPlugin;
```

---

`afterCreate(instance, ctx)`

Executed after the plugin instance has been created.

Typical use cases:

- registering global mocks
- setting active instances
- attaching test helpers
- synchronizing plugin state with external libraries

```typescript
afterCreate(instance, ctx) {
  setActivePinia(instance);
}
```

Most plugins do not need `beforeCreate()` or `afterCreate()`.

The majority of TestForge plugins only implement `create()`.

---

## Shared Instances

TestForge may internally reuse plugin instances when shared mode is enabled.

Plugin authors do not need to handle this explicitly.

The `createPluginInstance()` helper guarantees that:

- existing instances are reused as needed
- `expose()` callbacks are still executed
- lifecycle hooks continue to work correctly

---

## When should I use beforeCreate and afterCreate?

| Hook         | Typical usage                           |
| ------------ | --------------------------------------- |
| beforeCreate | merge defaults, normalize config        |
| create       | create plugin instance                  |
| afterCreate  | activate global state, register helpers |

Pinia:
afterCreate() -> setActivePinia()

Router:
create() only

I18n:
create() only

Vuetify:
create() only

---

## Plugin Checklist

1. **Name Alignment:** The string returned by `getName()` is identical to the property key inside `interface PluginOptionsMap` in `augmentation.ts`.
2. **Type Side-Effects Exported:** The main `index.ts` contains an explicit `import "./types/augmentation.js"`.
3. **Isolated Side-Effects:** Instance creation logic is completely encapsulated within the `create*.ts` file, keeping the factory testable independently from the core registry.
