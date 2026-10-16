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

`PluginControlOptions<TInstance>` describes instance-level TestForge controls for factory-based integrations. The legacy string-keyed `expose` callback is **not** part of this API. Consumers capture a managed instance with `captureInstance<TInstance>()` and spread the returned object into the plugin configuration; its internal symbol-keyed callback is handled by TestForge rather than by the native library.

Install-based plugins that do not produce a runtime instance should normally use the library configuration type directly rather than `PluginControlOptions`.

### What is `TInstance`?

For **factory-based plugins**, `TInstance` is the runtime Vue plugin instance created by the library factory and eventually passed to Vue Test Utils through `global.plugins`. Install-based integrations do not create an equivalent managed instance: their `create()` implementation returns a `[plugin, options]` tuple instead.

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

Choose the helper based on **how the upstream Vue library is integrated**, not on whether the TestForge plugin has a `create()` hook. Every TestForge plugin has `create()`, but that hook may return either a managed instance or an install tuple.

| Upstream integration                                                                   | TestForge helper         | Result                                 | Instance capture / reuse |
| -------------------------------------------------------------------------------------- | ------------------------ | -------------------------------------- | ------------------------ |
| A factory creates a Vue plugin instance, such as `createRouter()` or `createVuetify()` | `createPluginInstance()` | A managed runtime instance             | Supported                |
| An existing Vue plugin is installed using `app.use(plugin, options)`                   | `createVuePlugin()`      | `[plugin, options]` for Vue Test Utils | Not supported            |

**Factory-based integration:** write a dedicated adapter that delegates instance creation to `createPluginInstance()`:

```typescript
import { createPluginInstance } from "@testforgejs/vue-test-core";
import { createCustomLibraryInstance } from "some-vue-library";
import type { CustomInstance } from "some-vue-library";
import type { VueTestCustomOptions } from "../types/types.js";

export function createCustomPlugin(options: VueTestCustomOptions): CustomInstance {
  return createPluginInstance(createCustomLibraryInstance, options);
}
```

`createPluginInstance()` is responsible for the common TestForge behavior:

1. Read the internal instance-capture callback and shared-instance reference from the supplied options.
2. Create a **new native options object** without those two internal keys, leaving the original options unchanged.
3. Reuse an explicitly supplied instance when available; otherwise call the upstream factory with native options only.
4. Pass the resulting instance to the callback supplied by `captureInstance()`, when one is present. This also works for reused instances.

A native library option coincidentally named `expose` remains a **native option**. It is not the former TestForge capture callback and is not stripped by this helper.

**Install-based integration:** when the upstream library already exports an installable Vue plugin, use `createVuePlugin()` instead. It returns a Vue Test Utils-compatible `[plugin, options]` tuple; it does not create a separate managed instance. The complete example appears under [Install-based Plugins](#2-install-based-plugins).

Keep these adapters focused on the integrated library. Do not reimplement capture, shared-instance reuse, or internal-option filtering in individual plugins.

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

Returns a mountable value. For factory-based plugins this is the managed runtime instance; for install-based plugins it is the `[plugin, options]` tuple.

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

The category determines what `create()` returns, which core helper to call, and whether `captureInstance()` and shared-instance reuse are supported. A TestForge `create()` hook does **not** necessarily mean a third-party runtime instance is constructed.

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

- call `createPluginInstance()` to produce a managed runtime instance or reuse one supplied by TestForge;
- support instance capture through the public `captureInstance<TInstance>()` helper;
- prevent internal TestForge options from reaching the native instance factory;
- may use lifecycle hooks such as `afterCreate()`.

This is the preferred integration style when the library exposes a suitable factory.

For example, the Vuetify adapter delegates creation to the same helper:

```typescript
import { createVuetify } from "vuetify";
import { createPluginInstance } from "@testforgejs/vue-test-core";
import type { VueTestVuetifyOptions, VuetifyInstance } from "../types/types.js";

export function createVuetifyPlugin(options: VueTestVuetifyOptions): VuetifyInstance {
  return createPluginInstance(createVuetify, options);
}
```

The **plugin author** uses `createPluginInstance()` inside the adapter.
The **test author** uses `captureInstance<VuetifyInstance>()` when access
to the resulting instance is needed.

Instance capture is handled internally by `createPluginInstance()` using
a symbol-keyed callback. The legacy `expose` option is no longer part
of the TestForge instance capture API. Plugin authors must not implement
a separate `expose` callback or invoke the internal capture callback directly.

For example, in a component test:

```typescript
import { captureInstance } from "@testforgejs/vue-test-core";
import type { VuetifyInstance } from "@testforgejs/vue-test-plugin-vuetify";

const vuetifyCapture = captureInstance<VuetifyInstance>();

factory(
  {},
  {
    plugins: {
      vuetify: { ...vuetifyCapture },
    },
  },
);

// VuetifyInstance | undefined
const vuetify = vuetifyCapture.instance;
```

The `instance` getter is not copied into plugin options by object spread. Without an explicit generic, `captureInstance()` defaults to `unknown`; its instance type is **not inferred** from `plugins.vuetify` or another configuration key.

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

`createVuePlugin()` returns the installable plugin and its options without calling a factory or invoking `install()` itself. Vue Test Utils installs the plugin during mounting. Unlike `createPluginInstance()`, it does not capture or reuse runtime instances. The helper explicitly rejects the TestForge capture and shared-instance controls when supplied.

Characteristics:

- use `createVuePlugin()` to return `[plugin, options]` for Vue Test Utils;
- do not create a separate TestForge-managed runtime instance;
- **do not support** `captureInstance()` or TestForge shared-instance reuse;
- reject capture callbacks and supplied shared instances with a runtime error instead of silently ignoring them;
- allow Vue Test Utils / Vue to install the returned plugin using its normal install API.

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

- an existing instance is reused when requested instead of calling the native factory;
- `captureInstance()` receives either a newly created instance or the reused instance;
- internal capture and shared-instance options are excluded from native factory arguments;
- the original options are not mutated and lifecycle processing continues through TestForge.

Install-based integrations do not support shared-instance reuse or capture. Use `createVuePlugin()` for them rather than attempting to emulate managed instances.

Plugin-specific code should avoid duplicating side effects when the same instance is reused.

---

## When Should I Use `beforeCreate()` and `afterCreate()`?

| Hook                  | Typical usage                                |
| --------------------- | -------------------------------------------- |
| `getDefaultOptions()` | Optional project-independent plugin baseline |
| `beforeCreate()`      | Runtime normalization or derivation          |
| `create()`            | Return a managed instance or install tuple   |
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

   Factory-based libraries use `createPluginInstance()`; install-based libraries use `createVuePlugin()`. Only factory-based integrations support `captureInstance()` and shared-instance reuse.

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
