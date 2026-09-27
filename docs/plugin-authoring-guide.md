# TestForge Plugin Authoring Guide

Each TestForge plugin integrates a specific Vue library into the unified component mounting pipeline.

A plugin is responsible for:

- describing its configuration through strict TypeScript types;
- creating the Vue plugin or runtime instance used during mounting;
- optionally providing a minimal project-independent default configuration;
- exposing a consistent package-level API for presets, applications, and tooling.

A plugin should understand the library it integrates, but it should not make application-specific configuration decisions on behalf of the consuming project.

## Architecture & File Structure

New plugins should follow this structure:

```text
packages/vue-test-plugin-custom/
└── src/
    ├── index.ts                    # Public package entry point
    ├── defaults.ts                 # Optional project-independent defaults
    ├── constants/
    │   └── constants.ts            # Plugin name and package-level constants
    ├── module/
    │   ├── customPlugin.ts         # PluginModule definition
    │   └── createCustomPlugin.ts   # Isolated runtime creation logic
    └── types/
        ├── types.ts                # Plugin configuration interfaces
        └── augmentation.ts         # PluginOptionsMap augmentation
```

`defaults.ts` is optional. A plugin should expose defaults only when a safe project-independent baseline exists.

---

## Step-by-Step Implementation

### Step 1: Define Plugin Options (`types/types.ts`)

Declare the plugin options accepted by TestForge.

For stateful factory plugins, extend the third-party library's native options together with `PluginControlOptions<TInstance>`:

```typescript
import type { CustomOptions, CustomInstance } from "some-vue-library";
import type { PluginControlOptions } from "@testforgejs/vue-test-core";

export interface VueTestCustomOptions extends CustomOptions, PluginControlOptions<CustomInstance> {
  /** Additional TestForge-specific configuration fields, if needed. */
  mockApis?: boolean;
}
```

`PluginControlOptions<TInstance>` provides TestForge instance-level controls such as `expose`.

Install-based plugins that do not produce a runtime instance should normally use the library configuration type directly rather than `PluginControlOptions`.

### What is `TInstance`?

`TInstance` is the runtime Vue plugin instance created by the plugin factory and eventually passed to Vue Test Utils through `global.plugins`.

Examples:

- Pinia → `Pinia`
- Vue Router → `Router`
- Vue I18n → `I18n`
- Vuetify → `ReturnType<typeof createVuetify>`

Prefer the instance type exported by the integrated library:

```typescript
import type { Router } from "vue-router";
```

If the library only exposes a factory:

```typescript
import { createVuetify } from "vuetify";

type VuetifyInstance = ReturnType<typeof createVuetify>;
```

---

### Step 2: Define the Plugin Name (`constants/constants.ts`)

Define the plugin identifier once and reuse it throughout the package:

```typescript
export const CUSTOM_PLUGIN_NAME = "custom" as const;
```

The plugin name is part of the TestForge configuration contract.

It must match:

- the key registered in `PluginOptionsMap`;
- the value returned by `getName()`;
- the standardized package export `PLUGIN_NAME`.

Keeping the identifier in one constant prevents the runtime and type-level names from drifting apart.

---

### Step 3: Register via Module Augmentation (`types/augmentation.ts`)

Extend `PluginOptionsMap` so TestForge and the user's IDE recognize the plugin key and its configuration type.

```typescript
import type {} from "@testforgejs/vue-test-core";

import { CUSTOM_PLUGIN_NAME } from "../constants/constants.js";
import type { VueTestCustomOptions } from "./types.js";

declare module "@testforgejs/vue-test-core" {
  interface PluginOptionsMap {
    [CUSTOM_PLUGIN_NAME]: VueTestCustomOptions;
  }
}
```

The registered key must exactly match the value returned by `getName()`.

---

### Step 4: Define Plugin Defaults (`defaults.ts`)

A plugin may expose a project-independent baseline through `getDefaultOptions()`.

Default options are optional.

Use `PluginDefaultOptionsFactory<TOptions>`:

```typescript
import type { PluginDefaultOptionsFactory } from "@testforgejs/vue-test-core";
import type { VueTestCustomOptions } from "./types/types.js";

export const defaultOptions: PluginDefaultOptionsFactory<VueTestCustomOptions> = () => () => ({
  // Only configuration required for a safe,
  // project-independent integration baseline.
});
```

The outer function may use TestForge runtime context such as a supplied test runner. The inner options factory creates a fresh options object for each pipeline execution.

For example, a runner-aware plugin may use:

```typescript
export const defaultOptions: PluginDefaultOptionsFactory<VueTestCustomOptions> =
  (runner) => () => ({
    createSpy: runner?.fn,
  });
```

#### Defaults are opt-in

Providing `getDefaultOptions()` does **not** cause TestForge to apply those options automatically.

This:

```typescript
manifest: [
  {
    module: customPlugin,
    enabled: true,
  },
],
```

only declares that the plugin is available and enabled.

It does not imply:

```typescript
customPlugin.getDefaultOptions();
```

A preset must explicitly choose to use plugin defaults:

```typescript
defaults: {
  custom: customPlugin.getDefaultOptions(),
},
```

Therefore:

```text
manifest inclusion ≠ default configuration
```

This distinction is intentional.

A plugin may gain or change `getDefaultOptions()` without silently changing presets that do not reference those defaults.

---

## Designing Good Plugin Defaults

Plugin defaults represent the library-level baseline known by the plugin.

They should not represent the consuming application's configuration policy.

A good default configuration follows these principles.

### 1. Functional, not merely constructable

Defaults should provide a useful integration for ordinary component tests when such a baseline exists.

A configuration that only prevents the library constructor from throwing is not necessarily sufficient if the resulting plugin cannot perform its normal testing role.

At the same time, functionality should not be achieved by inventing application behavior.

### 2. Project-independent

Defaults must not require knowledge of the consuming application.

Avoid embedding application-specific values such as:

- application routes;
- translation messages;
- application locale;
- store state;
- themes or design-system policy;
- API endpoints;
- application-specific plugins;
- business configuration.

Those belong in a project preset.

### 3. Minimal

Add only configuration that is necessary for a reliable TestForge integration.

Do not repeat upstream defaults merely to make the options object more explicit.

For example, if the upstream library already defaults an optional field to an empty object and TestForge does not need to override that behavior, omit the field.

### 4. Preserve upstream behavior unless TestForge has a reason to override it

The integrated library should remain the owner of its own defaults.

TestForge should override upstream behavior only when doing so is necessary to provide a reliable, consistent, or appropriately isolated integration.

This reduces unnecessary TestForge policy and lowers the risk of divergence from future library behavior.

### 5. Avoid application policy

A plugin understands the library.

A preset understands the application.

Conceptually:

```text
Plugin
→ library knowledge
→ safe project-independent baseline

Preset
→ application/test-environment knowledge
→ routes, locales, themes, state, messages, etc.
```

For example, a Router plugin may choose an isolated history implementation because that concerns test integration, but it should not invent application routes.

### 6. Prefer deterministic and isolated test behavior

When TestForge must choose between multiple valid upstream configurations, prefer the option that avoids unnecessary dependency on ambient state.

Examples include:

- avoiding browser URL state when an isolated memory implementation is sufficient;
- avoiding shared mutable configuration;
- creating fresh runtime values for each options-factory invocation.

Environment-dependent behavior should be introduced only when it is required or explicitly requested.

### 7. Keep behavior consistent across the supported version range

Plugin defaults must work across the versions declared by the package's peer dependencies.

If an upstream default changed between supported major or minor versions, the plugin may explicitly configure the option when a stable TestForge baseline is important.

Do not assume that a default observed in the latest upstream version existed across the entire supported range.

### 8. Do not suppress useful diagnostics without a specific integration reason

Warnings and validation messages belong to the integrated library unless TestForge has a strong reason to alter them.

A quieter test output is not by itself sufficient reason to hide useful upstream diagnostics.

Projects that intentionally want different warning behavior can configure it in their presets.

### 9. Return fresh configuration

`getDefaultOptions()` returns an options factory.

Each invocation should produce fresh mutable configuration where necessary:

```typescript
const factory = customPlugin.getDefaultOptions();

const first = factory();
const second = factory();

first !== second;
```

Do not share mutable option objects or runtime instances through plugin defaults.

### 10. Omit defaults when no safe baseline exists

`getDefaultOptions()` is optional for a reason.

If the library cannot be meaningfully configured without application-specific information, do not invent that information.

Use `PluginModule` without `getDefaultOptions()` and require the preset to provide configuration explicitly.

---

## Plugin Defaults vs Preset Defaults

Plugin defaults are a reusable source of configuration.

A preset explicitly decides whether to use them.

For example:

```typescript
const preset = {
  manifest: [
    {
      module: customPlugin,
      enabled: true,
    },
  ],

  defaults: {
    custom: customPlugin.getDefaultOptions(),
  },
};
```

A project preset can instead define its own configuration:

```typescript
const preset = {
  manifest: [
    {
      module: customPlugin,
      enabled: true,
    },
  ],

  defaults: {
    custom: () => ({
      projectSpecificOption: true,
    }),
  },
};
```

The important distinction is ownership:

```text
Plugin defaults
→ reusable library integration baseline

Preset defaults
→ explicit configuration selected by the preset

Project configuration
→ application-specific policy
```

TestForge does not automatically fall back to `getDefaultOptions()` when a preset omits configuration.

---

### Step 5: Implement the Isolated Factory (`module/createCustomPlugin.ts`)

For a stateful plugin, write a dedicated function that creates the runtime library instance.

Use the core `createPluginInstance()` helper:

```typescript
import { createPluginInstance } from "@testforgejs/vue-test-core";
import { createCustomLibraryInstance } from "some-vue-library";

import type { CustomInstance } from "some-vue-library";
import type { VueTestCustomOptions } from "../types/types.js";

export function createCustomPlugin(options: VueTestCustomOptions): CustomInstance {
  return createPluginInstance<CustomInstance, VueTestCustomOptions>(
    createCustomLibraryInstance,
    options,
  );
}
```

The helper handles TestForge instance-level behavior such as shared-instance reuse and `expose()`.

Plugin factories should remain focused on adapting TestForge configuration to the integrated library.

---

### Step 6: Define the Plugin Module (`module/customPlugin.ts`)

A plugin without defaults implements `PluginModule`:

```typescript
import { CUSTOM_PLUGIN_NAME } from "../constants/constants.js";
import { createCustomPlugin } from "./createCustomPlugin.js";

import type { CustomInstance } from "some-vue-library";
import type { VueTestCustomOptions } from "../types/types.js";
import type { PluginModule } from "@testforgejs/vue-test-core";

export const customPlugin: PluginModule<CustomInstance, VueTestCustomOptions> = {
  getName: () => CUSTOM_PLUGIN_NAME,

  getDefinition: () => ({
    create: createCustomPlugin,
  }),
};
```

A plugin that provides defaults should implement `PluginModuleWithDefaults`:

```typescript
import { CUSTOM_PLUGIN_NAME } from "../constants/constants.js";
import { defaultOptions } from "../defaults.js";
import { createCustomPlugin } from "./createCustomPlugin.js";

import type { CustomInstance } from "some-vue-library";
import type { VueTestCustomOptions } from "../types/types.js";
import type { PluginModuleWithDefaults } from "@testforgejs/vue-test-core";

export const customPlugin: PluginModuleWithDefaults<CustomInstance, VueTestCustomOptions> = {
  getName: () => CUSTOM_PLUGIN_NAME,

  getDefinition: () => ({
    create: createCustomPlugin,
  }),

  getDefaultOptions: defaultOptions,
};
```

The core interfaces are:

```typescript
export interface PluginModule<TPlugin extends MountPlugin = MountPlugin, TOptions = unknown> {
  getName(): PluginName;
  getDefinition(): PluginDefinition<TPlugin, TOptions>;
  getDefaultOptions?: PluginDefaultOptionsFactory<TOptions>;
}

export interface PluginModuleWithDefaults<
  TPlugin extends MountPlugin = MountPlugin,
  TOptions = unknown,
> extends PluginModule<TPlugin, TOptions> {
  getDefaultOptions: PluginDefaultOptionsFactory<TOptions>;
}
```

Use `PluginModuleWithDefaults` when the package contract guarantees that defaults are available.

---

### Step 7: Export the Package API (`index.ts`)

Import the augmentation file so it is included in the package declaration graph.

Expose both the descriptive plugin API and the standardized package API:

```typescript
import "./types/augmentation.js";

export { customPlugin, customPlugin as plugin } from "./module/customPlugin.js";

export { CUSTOM_PLUGIN_NAME as PLUGIN_NAME } from "./constants/constants.js";

export * from "./types/types.js";
```

Consumers can then use the descriptive API:

```typescript
import { customPlugin } from "@testforgejs/vue-test-plugin-custom";
```

while generic tooling can rely on the standardized exports:

```typescript
import { plugin, PLUGIN_NAME } from "@testforgejs/vue-test-plugin-custom";
```

Every TestForge plugin package must expose the standardized `plugin` and
`PLUGIN_NAME` exports from its package entry point.

Generic tooling should rely on these standardized exports rather than
package-specific export names.

The standardized package contract is:

```text
plugin
→ PluginModule

PLUGIN_NAME
→ plugin identifier
```

---

## Plugin Lifecycle

A TestForge plugin may participate in three lifecycle stages:

```text
Resolved plugin options
    ↓
beforeCreate(ctx, options)
    ↓
create(options)
    ↓
afterCreate(instance, ctx)
```

Plugin defaults are resolved by the preset/pipeline before this lifecycle.

`beforeCreate()` should therefore not be used to implicitly apply `getDefaultOptions()`.

### `beforeCreate(ctx, options)`

Executed before the plugin instance is created.

Typical use cases:

- normalize resolved runtime configuration;
- derive runtime values from pipeline state;
- adapt options based on other enabled plugins;
- perform plugin-specific preprocessing that cannot be expressed statically.

It must return the final options passed to `create()`.

```typescript
beforeCreate(ctx, options) {
  return {
    ...options,
    normalizedOption: true,
  };
}
```

Avoid using `beforeCreate()` to introduce hidden defaults that belong in `getDefaultOptions()` or in a preset.

### `create(options)`

Creates the actual Vue plugin instance or mount plugin.

This hook is mandatory:

```typescript
create: createCustomPlugin;
```

### `afterCreate(instance, ctx)`

Executed after the plugin instance has been created.

Typical use cases:

- activating an instance in an upstream library;
- registering runtime helpers;
- synchronizing plugin state with external library state.

Example:

```typescript
afterCreate(instance) {
  setActivePinia(instance);
}
```

Most plugins need only `create()`.

---

## Plugin Categories

TestForge supports two main categories of Vue plugins.

The category determines how `create()` should be implemented and whether instance-level features such as `expose()` and shared-instance reuse are available.

### 1. Stateful Factory Plugins

These libraries expose a factory that creates a runtime Vue plugin instance.

Examples:

- Pinia
- Vue Router
- Vue I18n
- Vuetify

Typical APIs:

```typescript
createPinia();
createRouter();
createI18n();
createVuetify();
```

Implementation:

```typescript
export function createRouterPlugin(options: VueTestRouterOptions): Router {
  return createPluginInstance(createRouter, options);
}
```

Characteristics:

- produce a runtime instance;
- support `expose()`;
- support TestForge shared-instance reuse;
- may use lifecycle hooks such as `afterCreate()`.

This is the preferred integration style when the library exposes a suitable factory.

### 2. Install-based Plugins

These libraries expose an install object or install function rather than a factory-created runtime instance.

Example:

```typescript
app.use(PrimeVue, options);
```

Implementation:

```typescript
import PrimeVue from "primevue/config";
import { createVuePlugin } from "@testforgejs/vue-test-core";

import type { PrimeVueConfiguration } from "primevue/config";

export type PrimeVueMountPlugin = [typeof PrimeVue, PrimeVueConfiguration];

export type VueTestPrimeVueOptions = PrimeVueConfiguration;

export function createPrimeVuePlugin(options: VueTestPrimeVueOptions): PrimeVueMountPlugin {
  return createVuePlugin(PrimeVue, options);
}
```

Characteristics:

- do not create a separate stateful runtime instance;
- do not support instance-level `expose()`;
- do not participate in shared-instance reuse;
- are represented internally as Vue Test Utils plugin tuples.

Both stateful and install-based plugins may expose `getDefaultOptions()` when a safe project-independent configuration exists.

---

## Which Plugin Category Should I Choose?

Use a stateful factory plugin when the library exposes a factory:

```typescript
createRouter();
createPinia();
createI18n();
createVuetify();
```

Use an install-based plugin when the integration is based on:

```typescript
app.use(SomePlugin, options);
```

If a library provides both APIs, prefer the factory API when it represents the normal library integration because it provides better instance isolation and enables TestForge instance-level features.

---

## Shared Instances

Stateful plugins may reuse runtime instances through TestForge's shared-instance mechanism.

Plugin authors normally do not need to implement this themselves.

Using `createPluginInstance()` ensures that:

- an existing instance is reused when requested;
- `expose()` behavior remains consistent;
- lifecycle processing continues to work correctly.

Plugin-specific code should avoid duplicating side effects when the same instance is reused.

---

## When Should I Use `beforeCreate()` and `afterCreate()`?

| Hook                  | Typical usage                                |
| --------------------- | -------------------------------------------- |
| `getDefaultOptions()` | Optional project-independent plugin baseline |
| `beforeCreate()`      | Runtime normalization or derivation          |
| `create()`            | Create the Vue plugin instance               |
| `afterCreate()`       | Activate or synchronize the created instance |

Examples:

```text
Pinia
getDefaultOptions() → runner spy integration
create()            → createTestingPinia()
afterCreate()       → setActivePinia()

Router
getDefaultOptions() → isolated history + empty route table
create()            → createRouter()

I18n
getDefaultOptions() → Composition API integration baseline
create()            → createI18n()

Vuetify
getDefaultOptions() → library-level functional baseline
create()            → createVuetify()
```

Do not use lifecycle hooks merely to hide configuration that should be explicit in a preset or `getDefaultOptions()`.

---

## Testing Plugin Defaults

Defaults should be tested in the plugin package itself.

At minimum, verify the exact options returned:

```typescript
it("should provide default options", () => {
  expect(customPlugin.getDefaultOptions()()).toEqual({
    // expected plugin baseline
  });
});
```

Also verify that those options can create a functional library instance:

```typescript
it("should create a functional instance using default options", () => {
  const options = customPlugin.getDefaultOptions()();

  const definition = customPlugin.getDefinition();
  const instance = definition.create(options);

  expect(instance).toBeDefined();
});
```

Keep the boundary between unit and integration tests clear:

```text
plugin package
→ exact defaults
→ factory behavior
→ library instance creation

integration package
→ TestForge pipeline
→ Vue Test Utils mounting
→ interaction with real components
```

For example, testing that an I18n default contains `globalInjection: true` belongs in the plugin package.

Testing that a mounted component actually receives `$t` through the complete TestForge mounting pipeline belongs in integration tests.

---

## Plugin Checklist

Before publishing a plugin, verify:

1. **Name alignment**
   `getName()`, `PluginOptionsMap`, the package constant, and `PLUGIN_NAME` all use the same plugin identifier.

2. **Type augmentation is included**
   The package entry point imports `./types/augmentation.js`.

3. **Creation is isolated**
   Runtime instance creation lives in the dedicated `create*.ts` factory.

4. **Correct plugin category is used**
   Factory-based libraries use `createPluginInstance()`; install-based libraries use `createVuePlugin()`.

5. **Defaults are optional and explicit**
   Add `getDefaultOptions()` only when a safe project-independent baseline exists.

6. **Defaults are minimal**
   Do not repeat upstream defaults without an integration-specific reason.

7. **Defaults avoid application policy**
   Do not embed application routes, locales, messages, state, themes, or other project-specific configuration.

8. **Upstream behavior is preserved**
   Override upstream defaults only when TestForge needs different behavior for reliability, isolation, or compatibility.

9. **Supported versions are considered**
   Default behavior is valid across the package's declared peer-dependency range.

10. **Defaults are deterministic and isolated**
    Avoid unnecessary dependence on ambient browser state, globals, or shared mutable values.

11. **Diagnostics remain useful**
    Do not suppress upstream warnings merely to make test output quieter.

12. **Options factories return fresh values**
    Avoid shared mutable option objects between pipeline executions.

13. **Defaults are opt-in**
    Manifest inclusion alone never implicitly applies `getDefaultOptions()`.

14. **Lifecycle responsibilities remain clear**
    `beforeCreate()` does not silently inject plugin defaults; `afterCreate()` is reserved for runtime side effects that require the created instance.

15. **Package exports are standardized**
    Export both the descriptive plugin name and the generic `plugin` / `PLUGIN_NAME` entry points.

16. **Defaults are tested at the correct level**
    Exact defaults and instance creation belong in the plugin package; mounted-component behavior belongs in integration tests.
