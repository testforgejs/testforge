# TestForge Preset Authoring Guide

Presets in TestForge define **Runtime Environment Profiles** for component tests.

A preset determines:

- which managed plugins are available in the runtime environment;
- which plugins are enabled by default;
- the baseline configuration for those plugins;
- which configuration is valid for the selected runtime profile.

TestForge keeps the core engine intentionally unaware of specific Vue ecosystem libraries. Plugin capabilities and their configuration are supplied through presets.

For Vue projects, TestForge provides a runner-independent base package and runner-specific recommended presets:

- `@testforgejs/vue-test-preset-base`
- `@testforgejs/vue-test-preset-recommended` for Vitest
- `@testforgejs/vue-test-preset-recommended-jest` for Jest

Most applications should start with an existing preset and extend it rather than creating a complete preset from scratch.

A preset can be used in two ways when creating a TestForge framework:

- pass a single `PresetDefinition` through the `preset` option;
- pass a registry of named presets through the `presets` option.

These options are mutually exclusive. Use `preset` when the framework needs one custom runtime environment. Use `presets` when the project needs multiple named runtime profiles or when consuming an existing preset registry.

The `preset` option is internally treated as the framework's `default` preset.

---

## Table of Contents

- [Preset Structure](#1-preset-structure)
- [`preset` vs `presets`](#2-preset-vs-presets)
- [The `manifest`](#3-the-manifest)
- [The `defaults`](#4-the-defaults)
- [The `default` Preset](#5-the-default-preset)
- [Specialized Presets](#6-specialized-presets)
- [Preset Composition with `extendPreset()`](#7-preset-composition-with-extendpreset)

  - [Extending Plugin Defaults](#71-extending-plugin-defaults)

- [Runner-Specific Presets](#8-runner-specific-presets)
- [Selecting a Preset at Runtime](#9-selecting-a-preset-at-runtime)
- [Preset Configuration Layers](#10-preset-configuration-layers)
- [Creating a Project-Specific Preset](#11-creating-a-project-specific-preset)

  - [Project-Specific Router Configuration](#111-project-specific-router-configuration)

- [Preset Design Guidelines](#12-preset-design-guidelines)
- [Recommended Package Strategy](#13-recommended-package-strategy)
- [Summary](#14-summary)

---

## 1. Preset Structure

A `PresetDefinition` consists of two primary parts:

1. `manifest` — declares the managed plugins available in the runtime environment.
2. `defaults` — defines the baseline configuration factories for managed plugins.

Both properties are required.

```typescript
import type { PresetDefinition } from "@testforgejs/vue-test-core";
import { piniaPlugin, type VueTestPiniaOptions } from "@testforgejs/vue-test-plugin-pinia";
import { i18nPlugin, type VueTestI18nOptions } from "@testforgejs/vue-test-plugin-i18n";
import { routerPlugin } from "@testforgejs/vue-test-plugin-router";

const preset: PresetDefinition = {
  manifest: [
    { module: piniaPlugin, enabled: true },
    { module: i18nPlugin, enabled: true },
    { module: routerPlugin, enabled: false },
  ],

  defaults: {
    pinia: () =>
      ({
        initialState: {},
        stubActions: false,
      }) satisfies VueTestPiniaOptions,

    i18n: () =>
      ({
        legacy: false,
        locale: "en",
        fallbackLocale: "en",
        messages: {},
        fallbackWarn: false,
        missingWarn: false,
      }) satisfies VueTestI18nOptions,
  },
};
```

The `satisfies` operator is recommended because it validates the preset structure and provides plugin-specific type checking without changing the inferred type of the preset object.

The `defaults` object may be empty:

```typescript
const preset: PresetDefinition = {
  manifest: [{ module: piniaPlugin, enabled: true }],
  defaults: {},
};
```

An empty `defaults` object means that the preset does not provide baseline configuration for any of its declared plugins. This is valid when the corresponding plugin configuration is supplied through another configuration layer.

A plugin may also be declared in the manifest without a corresponding entry in `defaults`. In that case, the plugin is part of the preset's capability boundary, but the preset does not provide default options for that plugin.

---

## 2. `preset` vs `presets`

When creating a TestForge framework, you can provide either a single preset or a registry of named presets.

### Single custom preset

Use `preset` when the framework needs one runtime environment:

```typescript
import { createTestFramework } from "@testforgejs/vue-test-core";

const { testComponentFactory } = createTestFramework({
  preset,
});
```

The supplied preset is treated as the framework's `default` preset.

Conceptually:

```typescript
createTestFramework({
  preset,
});
```

is equivalent to:

```typescript
createTestFramework({
  presets: {
    default: preset,
  },
});
```

The `preset` form is useful for small projects or specialized test setups where there is no need for multiple named environments.

### Preset registry

Use `presets` when the framework needs multiple named runtime environments:

```typescript
import { createTestFramework } from "@testforgejs/vue-test-core";

const { testComponentFactory } = createTestFramework({
  presets: {
    default: defaultPreset,
    i18n: i18nPreset,
    router: routerPreset,
  },
});
```

The registry can contain multiple independent runtime profiles. A factory invocation can then select a specific profile by name.

### The options are mutually exclusive

A framework cannot be created with both `preset` and `presets`:

```typescript
// Invalid
createTestFramework({
  preset,
  presets,
});
```

This restriction keeps the framework configuration unambiguous: there is either one directly supplied preset or a named preset registry.

### Which form should you use?

Use `preset` when:

- the project has one custom runtime environment;
- you want the shortest configuration;
- you do not need named runtime profiles.

Use `presets` when:

- the project has multiple runtime environments;
- you need named specialized presets;
- you are consuming an official or shared preset registry;
- you want to compose several reusable preset definitions into a project-specific registry.

For most projects, using an official recommended preset through `presets` is the easiest way to get started. However, most applications will eventually benefit from a project-specific preset because application routes, managed plugins, and plugin defaults are inherently application-specific.

---

## 3. The `manifest`

The `manifest` defines the **plugin capability boundary** of a preset.

For example:

```typescript
manifest: [
  { module: piniaPlugin, enabled: true },
  { module: i18nPlugin, enabled: true },
  { module: routerPlugin, enabled: false },
],
```

This means:

- Pinia is registered and enabled;
- Vue I18n is registered and enabled;
- Vue Router is registered but disabled by default.

A plugin that is not declared in the active preset manifest is not part of that runtime environment.

Consequently, attempting to configure an undeclared plugin is invalid:

```typescript
factory(
  {},
  {
    plugins: {
      router: {},
    },
  },
  {},
  {
    preset: "i18nPreset",
  },
);
```

If `i18nPreset` does not declare Router in its manifest, TestForge rejects the Router configuration during validation.

This makes presets complete runtime profiles rather than partial configuration overlays.

### `enabled: false`

A plugin can be present in the manifest while disabled by default:

```typescript
manifest: [
  { module: routerPlugin, enabled: false },
],
```

This keeps Router inside the preset's capability boundary without automatically initializing it for every factory invocation.

The plugin can subsequently be enabled through the appropriate runtime configuration.

---

## 4. The `defaults`

The `defaults` object defines baseline configuration factories for managed plugins.

Each plugin default must be provided as a function that returns a fresh plugin options object:

```typescript
defaults: {
  pinia: () => ({
    initialState: {},
    stubActions: false,
  }),

  i18n: () => ({
    legacy: false,
    locale: "en",
    fallbackLocale: "en",
    messages: {},
  }),
},
```

TestForge invokes the factory when resolving the active preset configuration.

This ensures that each pipeline context receives its own plugin options object instead of sharing a mutable configuration object across component mounts.

For example:

```typescript
const defaultPinia = () => ({
  initialState: {},
  stubActions: false,
});
```

Each invocation returns a new configuration object:

```typescript
const first = defaultPinia();
const second = defaultPinia();

first !== second; // true
```

This is particularly important for nested configuration such as Pinia state, Vue Router history configuration, or Vue I18n messages.

Plugin-specific option types should be applied to the object returned by the factory:

```typescript
pinia: () =>
  ({
    initialState: {},
    stubActions: false,
  }) satisfies VueTestPiniaOptions,
```

Plugin configuration should be kept small and predictable.

Application-specific test data should generally not be placed into global preset defaults. Scenario-specific state belongs in factory or test-level configuration.

---

## 5. The `default` Preset

A preset registry should normally provide a `default` profile.

The `default` preset is used when no other preset is selected for a factory invocation.

```typescript
const { testComponentFactory } = createTestFramework({
  presets,
});
```

For a preset registry, the `default` profile should represent the runtime environment required by the majority of the project's component tests.

Specialized environments can be represented by additional named presets:

```typescript
export const presets = {
  default: defaultPreset,
  piniaPreset: piniaPreset,
  i18nPreset: i18nPreset,
  routerPreset: routerPreset,
};
```

However, a standalone `PresetDefinition` does not need to be named `default`.

When a single preset is passed through the `preset` option:

```typescript
createTestFramework({
  preset: myPreset,
});
```

TestForge internally treats it as the `default` preset.

This means that the `default` name belongs to the preset registry concept. It is not a required property of `PresetDefinition` itself.

---

## 6. Specialized Presets

A preset registry can contain multiple independent runtime profiles.

For example, `@testforgejs/vue-test-preset-base` provides:

- `default`
- `piniaPreset`
- `i18nPreset`
- `routerPreset`

The specialized presets intentionally contain only the plugins required by their respective environments.

For example:

```typescript
const i18nPreset: PresetDefinition = {
  manifest: [{ module: i18nPlugin, enabled: true }],

  defaults: {
    i18n: defaultI18n,
  },
};
```

`defaultI18n` is a plugin options factory, allowing each pipeline context to receive a fresh I18n configuration object.

This is different from disabling Pinia and Router in the default preset.

An `i18nPreset` does not merely disable unrelated plugins. Plugins that are not declared in its manifest are outside the runtime capability boundary altogether.

A specialized preset can be used either as an entry in a preset registry or directly through the `preset` option:

```typescript
createTestFramework({
  preset: i18nPreset,
});
```

or:

```typescript
createTestFramework({
  presets: {
    default: defaultPreset,
    i18n: i18nPreset,
  },
});
```

---

## 7. Preset Composition with `extendPreset()`

`extendPreset()` creates a new `PresetDefinition` from an existing preset.

```typescript
import { extendPreset } from "@testforgejs/vue-test-core";
import { presets as basePresets } from "@testforgejs/vue-test-preset-recommended";
import type { PresetDefinition } from "@testforgejs/vue-test-core";

const projectPreset: PresetDefinition = extendPreset(basePreset, {
  defaults: {
    i18n: () => ({
      ...basePresets.default.defaults.i18n(),
      // project-specific defaults
      locale: "uk",
    }),
  },
});
```

> Because preset defaults are factories, extending an existing plugin configuration requires invoking the base factory inside the replacement factory.

`extendPreset()` is a **preset composition mechanism**. It is not a runtime configuration overlay.

The resulting preset can be used directly through `preset`:

```typescript
createTestFramework({
  preset: projectPreset,
});
```

It can also be added to a named preset registry:

```typescript
export const presets = {
  default: projectPreset,
};

createTestFramework({
  presets,
});
```

This makes preset composition independent from the way the resulting preset is registered with the framework.

When an existing preset is almost suitable for a project, use `extendPreset()` instead of copying the entire preset.

### 7.1. Extending Plugin Defaults

When an extension provides configuration for an existing plugin, that plugin's configuration is replaced as a whole.

For example, suppose the base preset contains:

```typescript
defaults: {
  pinia: () => ({
    initialState: {},
    stubActions: false,
  }),
},
```

This extension:

```typescript
extendPreset(basePreset, {
  defaults: {
    pinia: () => ({
      createSpy: vi.fn,
    }),
  },
});
```

does not mean:

```text
initialState
+ stubActions
+ createSpy
```

The resulting Pinia configuration is the explicitly supplied configuration:

```typescript
{
  createSpy: vi.fn,
}
```

If existing options should be preserved, copy them explicitly:

```typescript
extendPreset(basePreset, {
  defaults: {
    pinia: () => ({
      ...basePreset.defaults.pinia(),
      createSpy: vi.fn,
    }),
  },
});
```

This replacement semantics makes preset composition predictable and prevents configuration from being inherited implicitly.

> Calling the base factory inside the new factory creates a fresh copy of the base options before applying the extension.

---

## 8. Runner-Specific Presets

The base preset should remain independent of the test runner whenever possible.

Runner-specific behavior belongs in runner-specific presets.

For example:

```text
@testforgejs/vue-test-preset-base
                │
        ┌───────┴────────┐
        ▼                ▼
 recommended       recommended-jest
   Vitest               Jest
```

The Vitest recommended preset can extend the base preset and provide Vitest-specific configuration:

```typescript
import { extendPreset } from "@testforgejs/vue-test-core";
import { presets as basePresets } from "@testforgejs/vue-test-preset-base";
import { vi } from "vitest";

export const presets = {
  default: extendPreset(basePresets.default, {
    defaults: {
      pinia: () => ({
        ...basePresets.default.defaults.pinia(),
        createSpy: vi.fn,
      }),
    },
  }),

  piniaPreset: extendPreset(basePresets.piniaPreset, {
    defaults: {
      pinia: () => ({
        ...basePresets.piniaPreset.defaults.pinia(),
        createSpy: vi.fn,
      }),
    },
  }),

  i18nPreset: basePresets.i18nPreset,
  routerPreset: basePresets.routerPreset,
};
```

The Jest recommended preset follows the same principle but supplies Jest-specific behavior.

This separation keeps the base preset reusable while allowing each runner-specific preset to provide the integration required by its test runner.

---

## 9. Selecting a Preset at Runtime

The `preset` option has two different roles in TestForge.

When passed to `createTestFramework()`, `preset` contains a complete `PresetDefinition`:

```typescript
createTestFramework({
  preset: myPreset,
});
```

When passed through a component factory's `extraOptions`, `preset` is a preset name:

```typescript
factory(
  {},
  {},
  {},
  {
    preset: "i18nPreset",
  },
);
```

The factory-level `preset` selects one of the named presets from the framework's preset registry.

Therefore:

```typescript
createTestFramework({
  preset: myPreset,
});
```

means **"configure this framework with this preset"**,

while:

```typescript
factory(
  {},
  {},
  {},
  {
    preset: "i18nPreset",
  },
);
```

means **"use the `i18nPreset` profile for this factory invocation"**.

When a framework is created with a single `preset`, that preset is registered internally as `default`, so the normal factory invocation uses it automatically:

```typescript
const factory = testComponentFactory(MyComponent);

factory();
```

For a framework created with `presets`, a named preset can be selected explicitly:

```typescript
const factory = testComponentFactory(MyComponent);

factory(
  {},
  {},
  {},
  {
    preset: "i18nPreset",
  },
);
```

The `preset` value is the **name of a preset in the framework's preset registry**.

The factory invocation now resolves its managed plugin environment against `i18nPreset` instead of the registry's `default` preset.

### Runtime presets are not overlays

Selecting a preset does not partially modify the default preset.

If the selected preset declares only I18n:

```typescript
i18nPreset: {
  manifest: [
    { module: i18nPlugin, enabled: true },
  ],
  defaults: {
    i18n: defaultI18n,
  },
},
```

Pinia is not implicitly inherited from `default`.

Each preset represents a complete managed-plugin runtime environment.

---

## 10. Preset Configuration Layers

Preset configuration is only the first layer of the complete TestForge configuration model.

A factory invocation can combine preset configuration with more local configuration.

Conceptually, the configuration is resolved through several scopes:

```text
Preset defaults
      ↓
defaultMountOptions
      ↓
mountOptions
      ↓
extraOptions.plugins
```

These layers do not all use the same merge strategy.

### Preset defaults

Provide the project-wide baseline for the selected runtime environment.

### `defaultMountOptions`

Provide factory-level defaults.

### `mountOptions`

Provide test-level configuration.

For managed plugins, `mountOptions.plugins` replaces the corresponding managed plugin configuration at the test level.

For example:

```typescript
factory(
  {},
  {
    plugins: {
      pinia: {
        initialState: {
          users: [],
        },
      },
    },
  },
);
```

This explicitly replaces the resolved Pinia configuration rather than silently deep-merging test state with factory state.

### `extraOptions.plugins`

Provides a shallow overlay on the already resolved managed plugin configuration.

For example:

```typescript
factory(
  {},
  {},
  {},
  {
    plugins: {
      pinia: {
        stubActions: true,
      },
    },
  },
);
```

If the resolved configuration contains:

```typescript
{
  initialState: {
    users: [{ id: 1 }],
  },
  stubActions: false,
}
```

the resulting configuration preserves `initialState` while changing `stubActions`.

Use:

- `mountOptions.plugins` when replacing a managed plugin configuration;
- `extraOptions.plugins` when making a targeted adjustment to an already resolved configuration.

---

## 11. Creating a Project-Specific Preset

A project does not need to create a complete preset registry when it only needs one custom runtime environment.

For example:

```typescript
import { createTestFramework, type PresetDefinition } from "@testforgejs/vue-test-core";

import { piniaPlugin } from "@testforgejs/vue-test-plugin-pinia";
import { vi } from "vitest";

const projectPreset: PresetDefinition = {
  manifest: [
    {
      module: piniaPlugin,
      enabled: true,
    },
  ],

  defaults: {
    pinia: () => ({
      initialState: {},
      stubActions: false,
      createSpy: vi.fn,
    }),
  },
};

const { testComponentFactory } = createTestFramework({
  preset: projectPreset,
});

export { testComponentFactory };
```

This is the simplest form of a project-specific TestForge environment.

### Using an Existing Preset as a Base

When an existing preset is close to what the project needs, compose it with `extendPreset()`:

```typescript
import { extendPreset } from "@testforgejs/vue-test-core";
import { presets as basePresets } from "@testforgejs/vue-test-preset-recommended";

const projectPreset = extendPreset(basePresets.default, {
  defaults: {
    i18n: () => ({
      ...basePresets.default.defaults.i18n(),
      locale: "uk",
      fallbackLocale: "uk",
    }),
  },
});
```

The resulting preset can then be passed directly to the framework:

```typescript
createTestFramework({
  preset: projectPreset,
});
```

If the project needs multiple environments, the same composed presets can instead be placed in a registry:

```typescript
const presets = {
  default: projectPreset,
  router: routerPreset,
};

createTestFramework({
  presets,
});
```

This allows preset authoring and framework registration to remain separate concerns.

### 11.1. Project-Specific Router Configuration

Router configuration is a good example of project-specific preset configuration.

A general-purpose preset can provide the Router plugin and its runner-independent defaults, but it cannot know which routes and components belong to a particular application.

For example, an application may need the following test routes:

```typescript
routes: [
  {
    path: "/",
    component: HomePage,
  },
  {
    path: "/users",
    component: UsersPage,
  },
],
```

These routes should be defined in the project's own preset rather than in the shared recommended preset.

If the project starts from an existing preset, extend its Router defaults explicitly:

```typescript
import { extendPreset } from "@testforgejs/vue-test-core";
import { presets as basePresets } from "@testforgejs/vue-test-preset-recommended";
import { createMemoryHistory } from "vue-router";

import HomePage from "@/views/HomePage.vue";
import UsersPage from "@/views/UsersPage.vue";

const projectPreset = extendPreset(basePresets.default, {
  defaults: {
    router: () => ({
      ...basePresets.default.defaults.router(),

      history: createMemoryHistory(),

      routes: [
        {
          path: "/",
          component: HomePage,
        },
        {
          path: "/users",
          component: UsersPage,
        },
      ],
    }),
  },
});
```

The resulting preset can be passed directly to the framework:

```typescript
import { createTestFramework } from "@testforgejs/vue-test-core";

const { testComponentFactory } = createTestFramework({
  preset: projectPreset,
});
```

If the project uses multiple runtime environments, the same project-specific preset can instead be placed in a preset registry:

```typescript
const presets = {
  default: projectPreset,
  router: routerPreset,
};

const { testComponentFactory } = createTestFramework({
  presets,
});
```

The important distinction is between **shared plugin configuration** and **application-specific runtime configuration**:

- the shared preset can provide the Router plugin and sensible generic defaults;
- the project-specific preset provides the application's routes and components;
- individual tests can still override Router configuration when a particular scenario requires it.

This keeps reusable presets independent of application structure while allowing each project to define the Router environment it actually needs.

> [!NOTE]
> Router configuration is particularly likely to be project-specific because routes reference application components and paths. For this reason, application routes generally belong in a project-specific preset rather than in an official recommended preset.

## 12. Preset Design Guidelines

### 12.1. Keep the base preset runner-independent

Do not put Vitest- or Jest-specific configuration into a runner-independent base preset.

Use a runner-specific preset when a plugin requires test-runner-specific functionality.

### 12.2. Prefer composition over duplication

If an existing preset is close to what the project needs, use `extendPreset()`.

Avoid copying an entire preset definition because copied presets can silently diverge from their source over time.

### 12.3. Remember replacement semantics

When extending an existing plugin configuration, providing a new configuration replaces that plugin's configuration.

Preserve selected base options explicitly:

```typescript
pinia: () => ({
  ...basePresets.default.defaults.pinia(),
  createSpy: vi.fn,
}),
```

> The extension still replaces the plugin defaults factory as a whole. Invoking the base factory and spreading its returned options is an explicit choice to preserve the base configuration.

### 12.4. Keep defaults minimal

Preset defaults should establish the environment, not encode every test scenario.

Avoid large, mutable application-specific state structures in global defaults.

Use factory-level or test-level configuration for scenario-specific state.

### 12.5. Keep runtime environments isolated

A preset should not cause mutable runtime instances to be shared between separate factory invocations.

Plugin integrations should create independent runtime state for each mount.

This is particularly important for stateful integrations such as:

- Pinia;
- Vue Router history;
- Vue I18n messages and related runtime state.

### 12.6. Use specialized presets for specialized environments

If a group of tests needs only one managed plugin, consider creating a specialized preset rather than enabling unrelated plugins.

For example:

```typescript
i18nPreset;
```

can define an environment containing only Vue I18n.

This makes the runtime boundary explicit and prevents unrelated plugins from being initialized.

### 12.7. Treat the manifest as a capability boundary

Do not assume that a plugin can be configured simply because its TestForge integration is installed.

The plugin must be declared in the active preset manifest.

Configuration for undeclared plugins should be treated as invalid.

---

## 13. Recommended Package Strategy

For reusable Vue testing infrastructure, a useful package structure is:

```text
@testforgejs/vue-test-preset-base
        │
        │  runner-independent plugin environments
        │
        ├───────────────┐
        ▼               ▼
@testforgejs/      @testforgejs/
vue-test-preset-   vue-test-preset-
recommended        recommended-jest
        │               │
        ▼               ▼
      Vitest            Jest
```

The base package should contain reusable plugin configuration that does not depend on a particular test runner.

The recommended packages can then specialize the base presets for their respective runners.

Projects can either use these recommended presets directly or compose their own project-specific presets with `extendPreset()`.

---

## 14. Summary

A TestForge preset defines a complete runtime environment for managed plugins.

The key principles are:

- `PresetDefinition` contains a `manifest` and a required `defaults` object;
- `manifest` defines the plugin capability boundary;
- `defaults` defines baseline plugin options as factories rather than shared configuration objects;
- a plugin may be present in the manifest without having a corresponding entry in `defaults`;
- each plugin options factory invocation produces fresh plugin options for the current pipeline context;
- `preset` in `createTestFramework()` accepts a single `PresetDefinition`;
- `presets` in `createTestFramework()` accepts a registry of named `PresetDefinition` objects;
- `preset` and `presets` are mutually exclusive;
- a single `preset` is internally treated as the `default` preset;
- a preset registry should normally provide a `default` profile;
- specialized presets provide isolated runtime profiles;
- `extendPreset()` composes reusable preset definitions;
- plugin configuration supplied to `extendPreset()` replaces that plugin's configuration as a whole;
- factory-level `extraOptions.preset` selects a named preset from the framework's registry;
- `mountOptions.plugins` replaces managed plugin configuration at a more local scope;
- `extraOptions.plugins` provides a targeted shallow overlay;
- runner-specific behavior belongs in runner-specific presets;
- mutable plugin runtime state must remain isolated between component factory invocations.

For most projects, the recommended workflow is:

1. Start with an official runner-specific recommended preset.
2. Use `presets` when consuming or maintaining a registry of named runtime profiles.
3. Use `preset` when a single custom runtime environment is sufficient.
4. Use `extendPreset()` for project-specific customization of an existing preset.
5. Keep test-specific state in factory or test configuration.
6. Add specialized presets when a distinct runtime environment is useful.
