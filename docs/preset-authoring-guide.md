# TestForge Preset Authoring Guide

Presets in TestForge define **runtime environment profiles** for component tests.

A preset determines:

- which managed plugins are available in the runtime environment;
- which plugins are enabled by default;
- which baseline configuration factories are selected for those plugins;
- which managed plugin configuration is valid for the selected runtime profile.

TestForge keeps the core engine intentionally unaware of specific Vue ecosystem libraries.

Responsibilities are separated between plugins and presets:

```text
plugin
→ owns library-specific integration knowledge
→ may expose project-independent defaults

preset
→ composes plugins into a runtime environment
→ chooses which plugins are enabled
→ explicitly selects or replaces plugin configuration

project preset
→ adds application-specific policy
```

A plugin may expose a project-independent integration baseline through `getDefaultOptions()`, but those defaults are never applied automatically. A preset explicitly decides whether to use them.

For Vue projects, TestForge provides a runner-independent base package and runner-specific recommended presets:

- `@testforgejs/vue-test-preset-base`
- `@testforgejs/vue-test-preset-recommended` for Vitest
- `@testforgejs/vue-test-preset-recommended-jest` for Jest

The base and recommended presets are intended as convenient starting points. Larger applications will typically evolve toward project-specific presets containing their own routes, localization, state policy, enabled plugin composition, and other application-specific configuration.

A preset can be used in two ways when creating a TestForge framework:

- pass a single `PresetDefinition` through `preset`;
- pass a registry of named presets through `presets`.

These options are mutually exclusive.

Use `preset` when the framework needs one runtime environment. Use `presets` when the project needs multiple named runtime profiles and runtime selection between them.

A single `preset` is internally treated as the framework's `default` preset.

---

## Table of Contents

- [Preset Structure](#1-preset-structure)
- [`preset` vs `presets`](#2-preset-vs-presets)
- [The `manifest`](#3-the-manifest)
- [The `defaults`](#4-the-defaults)
- [The `default` Preset](#5-the-default-preset)
- [Specialized Presets](#6-specialized-presets)
- [Preset Composition with `extendPreset()`](#7-preset-composition-with-extendpreset)
  - [Replacing and Preserving Plugin Configuration](#71-replacing-and-preserving-plugin-configuration)
  - [Extending the Manifest](#72-extending-the-manifest)
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
2. `defaults` — selects baseline configuration factories for managed plugins.

Both properties are required.

```typescript
import type { PresetDefinition } from "@testforgejs/vue-test-core";

import { piniaPlugin } from "@testforgejs/vue-test-plugin-pinia";
import { i18nPlugin } from "@testforgejs/vue-test-plugin-i18n";
import { routerPlugin } from "@testforgejs/vue-test-plugin-router";

const preset = {
  manifest: [
    { module: piniaPlugin, enabled: true },
    { module: i18nPlugin, enabled: true },
    { module: routerPlugin, enabled: false },
  ],

  defaults: {
    pinia: piniaPlugin.getDefaultOptions(),
    i18n: i18nPlugin.getDefaultOptions(),
    router: routerPlugin.getDefaultOptions(),
  },
} satisfies PresetDefinition;
```

This example demonstrates three independent concepts:

```text
manifest
→ determines which plugins belong to the runtime environment

enabled
→ determines whether a declared plugin is active by default

defaults
→ determines which baseline configuration factory the preset selects
```

A plugin can therefore be declared and have default configuration available while still being disabled by default.

For example:

```typescript
manifest: [
  {
    module: routerPlugin,
    enabled: false,
  },
],

defaults: {
  router: routerPlugin.getDefaultOptions(),
},
```

The Router integration belongs to the preset's capability boundary and has a baseline configuration ready, but it is not initialized unless enabled.

The `satisfies` operator is recommended because it validates the preset structure without changing the inferred type of the preset object:

```typescript
const preset = {
  // ...
} satisfies PresetDefinition;
```

The `defaults` object may also be empty:

```typescript
const preset: PresetDefinition = {
  manifest: [
    {
      module: piniaPlugin,
      enabled: true,
    },
  ],

  defaults: {},
};
```

An empty `defaults` object means that the preset does not provide baseline configuration for any declared plugin.

A plugin may therefore be present in the manifest without a corresponding `defaults` entry. It remains part of the preset's capability boundary, while its configuration can be supplied through another configuration layer.

---

## 2. `preset` vs `presets`

`createTestFramework()` supports two mutually exclusive preset configuration forms.

### Single preset

Use `preset` when the framework needs one runtime environment:

```typescript
import { createTestFramework } from "@testforgejs/vue-test-core";
import { presets } from "@testforgejs/vue-test-preset-recommended";

const { testComponentFactory } = createTestFramework({
  preset: presets.default,
});
```

The supplied preset is treated as the framework's `default` preset.

Conceptually:

```typescript
createTestFramework({
  preset,
});
```

is equivalent to registering:

```typescript
createTestFramework({
  presets: {
    default: preset,
  },
});
```

Use the single-preset form when:

- the project has one component-testing runtime environment;
- no runtime preset switching is required;
- you want the shortest framework configuration;
- the project has one application-specific preset.

For most projects, this is the simplest way to start:

```typescript
createTestFramework({
  preset: recommendedPresets.default,
});
```

As the application grows, that preset can be replaced with a project-specific preset without introducing a registry:

```typescript
createTestFramework({
  preset: projectPreset,
});
```

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

The registry can contain multiple independent runtime profiles.

A component factory invocation can then select a specific profile by name through `extraOptions.preset`.

Use `presets` when:

- the project genuinely needs multiple runtime environments;
- tests need runtime selection between named profiles;
- several specialized presets are maintained together;
- a shared preset registry is part of the project's testing architecture.

### The options are mutually exclusive

A framework cannot be created with both `preset` and `presets`:

```typescript
// Invalid
createTestFramework({
  preset,
  presets,
});
```

This keeps framework configuration unambiguous.

In general:

```text
preset
→ one runtime environment

presets
→ multiple named runtime environments
→ runtime selection through extraOptions.preset
```

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

- Pinia belongs to the runtime environment and is enabled;
- Vue I18n belongs to the runtime environment and is enabled;
- Vue Router belongs to the runtime environment but is disabled by default.

A plugin that is not declared in the active manifest is not part of that runtime environment.

Consequently, attempting to configure an undeclared plugin is invalid.

For example, if `i18nPreset` contains only Vue I18n:

```typescript
const i18nPreset: PresetDefinition = {
  manifest: [
    {
      module: i18nPlugin,
      enabled: true,
    },
  ],

  defaults: {
    i18n: i18nPlugin.getDefaultOptions(),
  },
};
```

then configuring Pinia while that preset is active is invalid:

```typescript
factory(
  {},
  {
    plugins: {
      pinia: {},
    },
  },
  {},
  {
    preset: "i18n",
  },
);
```

TestForge rejects the Pinia configuration because Pinia is outside the active preset's capability boundary.

This makes presets complete runtime profiles rather than partial configuration overlays.

### `enabled`

The `enabled` state belongs to the preset, not to the plugin defaults.

A plugin can expose `getDefaultOptions()` without making itself automatically active.

Similarly, placing a factory in `defaults` does not enable the plugin.

```text
plugin defaults
≠ plugin enablement
```

The manifest determines enablement:

```typescript
{
  module: routerPlugin,
  enabled: false,
}
```

while `defaults` determines baseline configuration:

```typescript
router: routerPlugin.getDefaultOptions(),
```

This separation allows a preset to make a plugin readily available without paying its runtime initialization cost for every mount.

### `enabled: false`

A plugin can be present in the manifest while disabled by default:

```typescript
manifest: [
  {
    module: routerPlugin,
    enabled: false,
  },
],
```

This is useful for contextual integrations that belong to the preset's supported runtime environment but are not required by most components.

The plugin can subsequently be enabled through the appropriate runtime or project-specific configuration.

The decision to enable a plugin by default is **preset policy**.

It should be based on the role that integration plays in the intended runtime environment, rather than on whether the plugin package merely exists.

---

## 4. The `defaults`

The `defaults` object selects baseline configuration factories for managed plugins.

Each entry is a plugin options factory:

```typescript
defaults: {
  pinia: piniaPlugin.getDefaultOptions(),
  i18n: i18nPlugin.getDefaultOptions(),
  router: routerPlugin.getDefaultOptions(),
},
```

TestForge invokes these factories while resolving the active preset configuration.

Each invocation should produce fresh configuration for the current pipeline context.

### Plugin-provided defaults

A plugin may expose a project-independent integration baseline through `getDefaultOptions()`:

```typescript
piniaPlugin.getDefaultOptions();
i18nPlugin.getDefaultOptions();
routerPlugin.getDefaultOptions();
```

The returned value is an options factory suitable for use in a preset.

For example:

```typescript
defaults: {
  i18n: i18nPlugin.getDefaultOptions(),
},
```

A preset does not need to reproduce the plugin's integration baseline manually.

When an appropriate plugin-provided baseline exists, prefer using it directly.

### Plugin defaults are opt-in

Plugin defaults are never applied automatically.

Declaring a plugin:

```typescript
manifest: [
  {
    module: routerPlugin,
    enabled: true,
  },
],
```

does **not** implicitly call:

```typescript
routerPlugin.getDefaultOptions();
```

A preset explicitly decides whether to use those defaults:

```typescript
defaults: {
  router: routerPlugin.getDefaultOptions(),
},
```

or provide a different configuration factory.

In other words:

```text
manifest inclusion ≠ default configuration
```

This is important for API stability.

A plugin can gain or change `getDefaultOptions()` without silently changing existing presets that do not reference those defaults.

### Plugin defaults vs preset policy

Plugin-provided defaults represent a reusable, project-independent integration baseline.

A project preset can build application-specific policy on top of that baseline.

For example:

```typescript
const i18nDefaults = i18nPlugin.getDefaultOptions();

const projectPreset = extendPreset(recommendedPresets.default, {
  defaults: {
    i18n: () => ({
      ...i18nDefaults(),
      locale: "uk",
      fallbackLocale: "uk",
      messages,
    }),
  },
});
```

Here:

```text
i18nPlugin.getDefaultOptions()
→ plugin-owned integration baseline

locale / fallbackLocale / messages
→ project-owned application policy
```

The same principle applies to other plugins:

```text
Pinia plugin
→ runner integration

project preset
→ state/action policy

Router plugin
→ isolated history baseline

project preset
→ application routes

I18n plugin
→ Vue integration mode

project preset
→ locales and translations
```

### Fresh options

Plugin defaults are factories rather than shared configuration objects:

```typescript
const i18nDefaults = i18nPlugin.getDefaultOptions();

const first = i18nDefaults();
const second = i18nDefaults();

first !== second; // true
```

Some factories also create fresh nested runtime values.

For example, Router defaults create a new history instance:

```typescript
const routerDefaults = routerPlugin.getDefaultOptions();

const first = routerDefaults();
const second = routerDefaults();

first.history !== second.history; // true
```

This prevents mutable configuration or runtime state from being unintentionally shared between independent pipeline contexts.

### Custom defaults

A preset can also define its own options factory directly:

```typescript
defaults: {
  i18n: () => ({
    legacy: false,
    globalInjection: true,
    locale: "uk",
    messages,
  }),
},
```

This is appropriate when the preset intentionally owns that configuration.

However, avoid manually reproducing plugin-provided defaults when the plugin already exposes the required baseline.

---

## 5. The `default` Preset

A preset registry should normally provide a `default` profile:

```typescript
const { testComponentFactory } = createTestFramework({
  presets,
});
```

The `default` preset is used when no other named preset is selected for a factory invocation.

For a project-specific registry, the `default` profile should represent the runtime environment required by the majority of that project's component tests.

Specialized environments can be represented by additional named presets:

```typescript
export const presets = {
  default: defaultPreset,
  i18n: i18nPreset,
  router: routerPreset,
};
```

A standalone `PresetDefinition`, however, does not need to be named `default`.

When a single preset is passed through `preset`:

```typescript
createTestFramework({
  preset: projectPreset,
});
```

TestForge internally treats it as the `default` preset.

The name `default` therefore belongs to the registry model. It is not part of `PresetDefinition` itself.

### Default enablement

The enabled state of plugins in a default preset should reflect the intended role of that preset.

For example, the official base and recommended presets are designed as convenient starting environments rather than minimal application-specific configurations.

Their default composition can therefore favor broadly useful infrastructure while keeping contextual integrations opt-in.

Conceptually:

```text
broadly shared runtime infrastructure
→ may be enabled by default

context-specific integration
→ often better disabled by default
```

For example, in the official Vue presets:

```text
Vue I18n
→ broadly shared UI integration
→ enabled

Pinia
→ broadly useful application-state integration
→ enabled

Vue Router
→ contextual navigation integration
→ disabled
```

This is a preset-level design choice.

A larger application can define a project-specific preset with exactly the enabled integrations it requires.

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
  manifest: [
    {
      module: i18nPlugin,
      enabled: true,
    },
  ],

  defaults: {
    i18n: i18nPlugin.getDefaultOptions(),
  },
};
```

This is different from disabling unrelated plugins in a broader preset.

If Pinia and Router are absent from `i18nPreset.manifest`, they are outside that runtime profile's capability boundary altogether.

A specialized preset can be used directly:

```typescript
createTestFramework({
  preset: i18nPreset,
});
```

or registered as one of several runtime environments:

```typescript
createTestFramework({
  presets: {
    default: defaultPreset,
    i18n: i18nPreset,
  },
});
```

Use specialized presets when the project genuinely benefits from distinct runtime environments.

Do not create additional profiles merely to avoid ordinary test-level configuration.

---

## 7. Preset Composition with `extendPreset()`

`extendPreset()` creates a new `PresetDefinition` from an existing preset.

This is the preferred way to adapt an existing preset without copying the entire definition.

For example:

```typescript
import { extendPreset } from "@testforgejs/vue-test-core";
import { i18nPlugin } from "@testforgejs/vue-test-plugin-i18n";
import { presets as recommendedPresets } from "@testforgejs/vue-test-preset-recommended";

const i18nDefaults = i18nPlugin.getDefaultOptions();

const projectPreset = extendPreset(recommendedPresets.default, {
  defaults: {
    i18n: () => ({
      ...i18nDefaults(),
      locale: "uk",
      fallbackLocale: "uk",
    }),
  },
});
```

`extendPreset()` is a **preset composition mechanism**.

It is not a runtime configuration overlay.

The resulting preset can be used directly:

```typescript
createTestFramework({
  preset: projectPreset,
});
```

or registered alongside other presets:

```typescript
const presets = {
  default: projectPreset,
  router: projectRouterPreset,
};

createTestFramework({
  presets,
});
```

Preset composition and framework registration are separate concerns.

### 7.1. Replacing and Preserving Plugin Configuration

When an extension provides a `defaults` factory for an existing plugin, that factory replaces the existing preset factory as a whole.

Suppose the base preset contains:

```typescript
defaults: {
  i18n: i18nPlugin.getDefaultOptions(),
},
```

and the extension provides:

```typescript
extendPreset(basePreset, {
  defaults: {
    i18n: () => ({
      locale: "uk",
    }),
  },
});
```

The resulting I18n preset configuration is:

```typescript
{
  locale: "uk",
}
```

It does not implicitly retain:

```typescript
{
  legacy: false,
  globalInjection: true,
}
```

from another factory.

This replacement behavior is intentional.

It keeps preset composition explicit and prevents an extension from silently inheriting configuration it did not request.

#### Preserving the source preset configuration

If the goal is to preserve the exact baseline selected by the source preset, invoke its factory explicitly:

```typescript
const baseI18n = basePreset.defaults.i18n;

const projectPreset = extendPreset(basePreset, {
  defaults: {
    i18n: () => ({
      ...baseI18n(),
      locale: "uk",
    }),
  },
});
```

This means:

```text
preserve the source preset's selected configuration
→ then add project policy
```

#### Starting from the plugin baseline

If the project wants to depend directly on the plugin-owned integration baseline instead, use `getDefaultOptions()`:

```typescript
const i18nDefaults = i18nPlugin.getDefaultOptions();

const projectPreset = extendPreset(basePreset, {
  defaults: {
    i18n: () => ({
      ...i18nDefaults(),
      locale: "uk",
    }),
  },
});
```

This means:

```text
start from the plugin integration baseline
→ then add project policy
```

These approaches are related but semantically different.

Use the source preset factory when preserving the source preset's behavior is intentional.

Use `getDefaultOptions()` when the project wants to depend directly on the plugin contract.

### 7.2. Extending the Manifest

An extension can also change the preset's capability boundary or default enablement.

For example, the official default preset declares Router but keeps it disabled.

A project can enable it without redeclaring the complete manifest:

```typescript
const projectPreset = extendPreset(recommendedPresets.default, {
  manifest: [
    {
      module: routerPlugin,
      enabled: true,
    },
  ],
});
```

The extension can also introduce another managed plugin:

```typescript
const projectPreset = extendPreset(basePreset, {
  manifest: [
    {
      module: customPlugin,
      enabled: true,
    },
  ],

  defaults: {
    custom: customPlugin.getDefaultOptions(),
  },
});
```

When extending a preset, treat `manifest` and `defaults` as separate responsibilities:

```text
manifest
→ capability + default enablement

defaults
→ baseline plugin configuration
```

Changing one does not implicitly change the other.

---

## 8. Runner-Specific Presets

The base preset should remain independent of a particular test runner whenever possible.

Runner-specific behavior belongs in runner-specific presets.

Conceptually:

```text
@testforgejs/vue-test-preset-base
                │
        ┌───────┴────────┐
        ▼                ▼
recommended       recommended-jest
   Vitest              Jest
```

The runner-specific preset should provide runner context to plugins that need it, without duplicating library-specific integration knowledge.

For Vitest:

```typescript
import { vi } from "vitest";

import { extendPreset } from "@testforgejs/vue-test-core";
import { presets as basePresets } from "@testforgejs/vue-test-preset-base";
import { piniaPlugin } from "@testforgejs/vue-test-plugin-pinia";

export const presets = {
  default: extendPreset(basePresets.default, {
    defaults: {
      pinia: piniaPlugin.getDefaultOptions(vi),
    },
  }),

  piniaPreset: extendPreset(basePresets.piniaPreset, {
    defaults: {
      pinia: piniaPlugin.getDefaultOptions(vi),
    },
  }),

  i18nPreset: basePresets.i18nPreset,
  routerPreset: basePresets.routerPreset,
};
```

For Jest:

```typescript
import { jest } from "@jest/globals";

import { extendPreset } from "@testforgejs/vue-test-core";
import { presets as basePresets } from "@testforgejs/vue-test-preset-base";
import { piniaPlugin } from "@testforgejs/vue-test-plugin-pinia";

export const presets = {
  default: extendPreset(basePresets.default, {
    defaults: {
      pinia: piniaPlugin.getDefaultOptions(jest),
    },
  }),

  piniaPreset: extendPreset(basePresets.piniaPreset, {
    defaults: {
      pinia: piniaPlugin.getDefaultOptions(jest),
    },
  }),

  i18nPreset: basePresets.i18nPreset,
  routerPreset: basePresets.routerPreset,
};
```

The important responsibility boundary is:

```text
runner-specific preset
→ knows which test runner is used

Pinia plugin
→ knows how runner support maps to Pinia testing configuration
```

The preset therefore does not reproduce Pinia's configuration manually.

It asks the Pinia plugin for the appropriate runner-aware baseline:

```typescript
piniaPlugin.getDefaultOptions(vi);
piniaPlugin.getDefaultOptions(jest);
```

Runner-independent plugins can continue using the configuration inherited from the base preset.

---

## 9. Selecting a Preset at Runtime

The name `preset` appears at two different API levels in TestForge.

### Framework-level `preset`

When passed to `createTestFramework()`, `preset` contains a complete `PresetDefinition`:

```typescript
createTestFramework({
  preset: projectPreset,
});
```

This means:

```text
configure this framework with this runtime environment
```

When a framework is created this way, the preset is internally registered as `default`.

Normal factory invocations use it automatically:

```typescript
const factory = testComponentFactory(MyComponent);

factory();
```

### Factory-level `extraOptions.preset`

When using a named preset registry, `extraOptions.preset` contains the **name** of a registered preset:

```typescript
const { testComponentFactory } = createTestFramework({
  presets: {
    default: defaultPreset,
    i18n: i18nPreset,
  },
});

const factory = testComponentFactory(MyComponent);

factory(
  {},
  {},
  {},
  {
    preset: "i18n",
  },
);
```

This means:

```text
use the "i18n" runtime profile for this factory invocation
```

Therefore:

```text
createTestFramework({ preset })
→ accepts a PresetDefinition

createTestFramework({ presets })
→ registers named PresetDefinition objects

extraOptions.preset
→ selects one registered preset by name
```

Runtime switching between multiple profiles requires a named registry supplied through `presets`.

### Runtime presets are not overlays

Selecting another named preset does not partially modify the `default` preset.

For example:

```typescript
const presets = {
  default: defaultPreset,

  i18n: {
    manifest: [
      {
        module: i18nPlugin,
        enabled: true,
      },
    ],

    defaults: {
      i18n: i18nPlugin.getDefaultOptions(),
    },
  },
};
```

Selecting:

```typescript
{
  preset: "i18n",
}
```

does not inherit Pinia or Router from `default`.

The `i18n` preset defines the complete managed-plugin runtime environment for that invocation.

---

## 10. Preset Configuration Layers

Preset configuration is only the first layer of the complete TestForge configuration model.

A component factory invocation can combine preset configuration with more local configuration.

Conceptually:

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

Preset defaults provide the baseline managed-plugin configuration for the selected runtime environment.

For example:

```typescript
defaults: {
  pinia: piniaPlugin.getDefaultOptions(vi),
}
```

### `defaultMountOptions`

`defaultMountOptions` provides reusable factory-level defaults.

These options apply to mounts created by the component factory unless replaced or adjusted by a more local layer.

### `mountOptions`

`mountOptions` provides configuration for an individual mount.

For managed plugins, `mountOptions.plugins` replaces the corresponding resolved plugin configuration at that level.

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

This replaces the resolved Pinia configuration rather than silently deep-merging the supplied state into it.

Use this when the test intentionally provides a complete plugin configuration for that mount.

### `extraOptions.plugins`

`extraOptions.plugins` provides a targeted shallow overlay on the already resolved managed-plugin configuration.

For example:

```typescript
factory(
  {},
  {},
  {},
  {
    plugins: {
      pinia: {
        stubActions: false,
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
  createSpy: vi.fn,
}
```

the overlay preserves those options while adding:

```typescript
{
  stubActions: false,
}
```

Use:

- `mountOptions.plugins` when replacing managed plugin configuration for a mount;
- `extraOptions.plugins` when applying a targeted adjustment to the already resolved configuration.

Scenario-specific configuration should generally live in these local layers rather than being placed into global preset defaults.

---

## 11. Creating a Project-Specific Preset

The official base and recommended presets are convenient starting points.

A real application can define its own preset once its component-testing environment requires application-specific policy.

A project does not need a preset registry when it only needs one runtime environment.

### Creating a preset directly

For example:

```typescript
import { createTestFramework, type PresetDefinition } from "@testforgejs/vue-test-core";

import { piniaPlugin } from "@testforgejs/vue-test-plugin-pinia";
import { vi } from "vitest";

const projectPreset = {
  manifest: [
    {
      module: piniaPlugin,
      enabled: true,
    },
  ],

  defaults: {
    pinia: piniaPlugin.getDefaultOptions(vi),
    stubActions: false,
  },
} satisfies PresetDefinition;

const { testComponentFactory } = createTestFramework({
  preset: projectPreset,
});

export { testComponentFactory };
```

This is the simplest form of a project-specific TestForge environment.

Application policy can be added explicitly.

For example, if the project wants real Pinia actions:

```typescript
const piniaDefaults = piniaPlugin.getDefaultOptions(vi);

const projectPreset = {
  manifest: [
    {
      module: piniaPlugin,
      enabled: true,
    },
  ],

  defaults: {
    pinia: () => ({
      ...piniaDefaults(),
      stubActions: false,
    }),
  },
} satisfies PresetDefinition;
```

The distinction is explicit:

```text
createSpy
→ provided by the plugin's runner integration

stubActions: false
→ chosen by the project
```

### Using an existing preset as a base

When an existing recommended preset is close to what the project needs, compose it with `extendPreset()`:

```typescript
import { extendPreset } from "@testforgejs/vue-test-core";

import { i18nPlugin } from "@testforgejs/vue-test-plugin-i18n";
import { presets as recommendedPresets } from "@testforgejs/vue-test-preset-recommended";

const i18nDefaults = i18nPlugin.getDefaultOptions();

const projectPreset = extendPreset(recommendedPresets.default, {
  defaults: {
    i18n: () => ({
      ...i18nDefaults(),
      locale: "uk",
      fallbackLocale: "uk",
      messages,
    }),
  },
});
```

The resulting preset can be passed directly to the framework:

```typescript
createTestFramework({
  preset: projectPreset,
});
```

If the project later needs multiple runtime environments, the same composed presets can be placed in a registry:

```typescript
const presets = {
  default: projectPreset,
  router: projectRouterPreset,
};

createTestFramework({
  presets,
});
```

This keeps preset authoring separate from framework registration.

### 11.1. Project-Specific Router Configuration

Router configuration is a good example of application-specific preset policy.

A general-purpose plugin can provide a project-independent Router baseline:

```typescript
{
  history: createMemoryHistory(),
  routes: [],
}
```

but it cannot know which routes and components belong to a particular application.

Application routes therefore belong in the project's own preset.

For example:

```typescript
import { extendPreset } from "@testforgejs/vue-test-core";

import { routerPlugin } from "@testforgejs/vue-test-plugin-router";
import { presets as recommendedPresets } from "@testforgejs/vue-test-preset-recommended";

import HomePage from "@/views/HomePage.vue";
import UsersPage from "@/views/UsersPage.vue";

const routerDefaults = routerPlugin.getDefaultOptions();

const projectPreset = extendPreset(recommendedPresets.default, {
  manifest: [
    {
      module: routerPlugin,
      enabled: true,
    },
  ],

  defaults: {
    router: () => ({
      ...routerDefaults(),

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

Two separate decisions are made here.

First, the project enables Router:

```typescript
manifest: [
  {
    module: routerPlugin,
    enabled: true,
  },
];
```

This is necessary because the official default preset declares Router but keeps it disabled.

Second, the project extends the Router plugin baseline with application routes:

```typescript
router: () => ({
  ...routerDefaults(),
  routes,
});
```

The project does not need to reproduce the in-memory history because that is already part of the Router plugin's project-independent baseline.

Conceptually:

```text
Router plugin
→ isolated memory history
→ empty route table

project preset
→ enables Router
→ supplies application routes
```

The resulting preset can be used directly:

```typescript
import { createTestFramework } from "@testforgejs/vue-test-core";

const { testComponentFactory } = createTestFramework({
  preset: projectPreset,
});
```

If another history implementation is part of the project's testing policy, override it explicitly:

```typescript
import { createWebHistory } from "vue-router";

const projectPreset = extendPreset(recommendedPresets.default, {
  manifest: [
    {
      module: routerPlugin,
      enabled: true,
    },
  ],

  defaults: {
    router: () => ({
      ...routerDefaults(),
      history: createWebHistory(),
      routes,
    }),
  },
});
```

This keeps shared plugin configuration independent of application structure while allowing each project to define the Router environment it actually needs.

> [!NOTE]
> Router configuration is particularly likely to be project-specific because routes reference application paths and components. Application routes generally belong in a project-specific preset rather than in an official base or recommended preset.

---

## 12. Preset Design Guidelines

### 12.1. Keep the base preset runner-independent

Do not place Vitest- or Jest-specific configuration directly into a runner-independent base preset.

Use runner-specific presets when an integration requires runner context.

For example:

```typescript
piniaPlugin.getDefaultOptions();
```

is suitable for a runner-independent preset, while:

```typescript
piniaPlugin.getDefaultOptions(vi);
```

belongs in a Vitest-specific preset.

### 12.2. Prefer composition over duplication

If an existing preset is close to what the project needs, use `extendPreset()`.

Avoid copying the complete preset definition.

Copied presets can silently diverge from their source as TestForge evolves.

### 12.3. Remember replacement semantics

Providing a new plugin factory through `extendPreset()` replaces that plugin's existing preset factory.

If the existing configuration should be retained, preserve it explicitly:

```typescript
const baseI18n = basePreset.defaults.i18n;

const projectPreset = extendPreset(basePreset, {
  defaults: {
    i18n: () => ({
      ...baseI18n(),
      locale: "uk",
    }),
  },
});
```

The extension still replaces the factory as a whole.

Invoking another factory and spreading its returned options is an explicit composition decision.

### 12.4. Prefer plugin-provided defaults

When a plugin exposes an appropriate `getDefaultOptions()`, prefer using it instead of reproducing the integration baseline manually.

Prefer:

```typescript
defaults: {
  router: routerPlugin.getDefaultOptions(),
}
```

over manually copying:

```typescript
defaults: {
  router: () => ({
    history: createMemoryHistory(),
    routes: [],
  }),
}
```

The plugin package should remain the owner of its project-independent integration baseline.

### 12.5. Keep plugin defaults and application policy separate

Plugin-provided defaults should represent project-independent integration behavior.

Application-specific choices belong in project presets.

Examples include:

- application routes;
- locales and fallback locales;
- translation messages;
- initial application state;
- action stubbing policy;
- themes;
- icons;
- API-specific configuration;
- application-specific managed plugins.

Conceptually:

```text
plugin
→ library integration

project preset
→ application policy
```

### 12.6. Keep defaults minimal

Preset defaults should establish the runtime environment, not encode every test scenario.

Avoid putting large mutable test fixtures into global preset configuration.

Scenario-specific state generally belongs in factory- or test-level configuration.

### 12.7. Preserve upstream behavior unless policy requires otherwise

When a project does not need different behavior, allow the integrated library or plugin baseline to remain in control.

Do not copy or override options merely for explicitness.

This keeps project presets smaller and reduces unnecessary coupling to upstream configuration details.

### 12.8. Keep runtime environments isolated

A preset should not cause mutable runtime state to be unintentionally shared between independent pipeline contexts.

This is particularly important for stateful integrations such as:

- Pinia;
- Vue Router history;
- Vue I18n runtime state.

Use options factories and plugin factories that create fresh values where required.

### 12.9. Use specialized presets for specialized environments

If a meaningful group of tests requires a distinctly different runtime environment, consider a specialized preset.

For example:

```typescript
const routerPreset: PresetDefinition = {
  manifest: [
    {
      module: routerPlugin,
      enabled: true,
    },
  ],

  defaults: {
    router: routerPlugin.getDefaultOptions(),
  },
};
```

Do not create specialized presets merely to make small per-test adjustments.

Use local configuration layers for scenario-specific changes.

### 12.10. Treat the manifest as a capability boundary

Do not assume that a plugin can be configured simply because its package is installed.

The plugin must be declared in the active preset manifest.

Configuration for undeclared managed plugins is invalid.

### 12.11. Treat enabled state as preset policy

`getDefaultOptions()` determines configuration, not enablement.

Whether a plugin should be active by default depends on the runtime profile the preset is trying to represent.

A broadly shared integration may reasonably be enabled in a convenience preset.

A contextual integration may be declared but disabled.

A project-specific preset should choose the enabled set that best represents that application's component runtime.

### 12.12. Treat official presets as starting points

Official base and recommended presets are not intended to model every application perfectly.

They provide a convenient environment for adopting TestForge quickly.

As an application grows, define a project-specific preset that makes its testing policy explicit:

```typescript
createTestFramework({
  preset: projectPreset,
});
```

This is the natural place for application routes, localization, state policy, plugin enablement, themes, and other project-specific behavior.

---

## 13. Recommended Package Strategy

For reusable Vue testing infrastructure, a useful package structure is:

```text
@testforgejs/vue-test-preset-base
        │
        │ runner-independent composition
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

The base package should:

- compose runner-independent managed plugins;
- choose their default enabled state;
- explicitly select project-independent defaults exposed by plugin packages;
- avoid test-runner-specific configuration.

Runner-specific recommended packages should:

- reuse the base preset composition;
- add runner context only where required;
- keep library-specific integration knowledge inside the plugin packages.

For example:

```text
recommended
→ supplies vi

Pinia plugin
→ converts vi into createSpy configuration
```

rather than:

```text
recommended
→ manually reimplements Pinia defaults
```

Projects can use the recommended preset directly as a starting point:

```typescript
createTestFramework({
  preset: recommendedPresets.default,
});
```

or derive an application-specific environment:

```typescript
const projectPreset = extendPreset(recommendedPresets.default, {
  // application-specific policy
});

createTestFramework({
  preset: projectPreset,
});
```

A named preset registry should be introduced when the project actually benefits from multiple independent runtime environments.

---

## 14. Summary

A TestForge preset defines a complete managed-plugin runtime environment.

The key principles are:

- `PresetDefinition` contains a `manifest` and a required `defaults` object;
- `manifest` defines the plugin capability boundary;
- the manifest also defines each plugin's default enabled state;
- a plugin may be declared without a corresponding `defaults` entry;
- a `defaults` entry does not enable a plugin;
- plugins may expose project-independent defaults through `getDefaultOptions()`;
- plugin defaults are opt-in and are not applied merely because a plugin appears in the manifest;
- preset defaults are plugin options factories rather than shared configuration objects;
- options factories should produce fresh configuration for independent pipeline contexts;
- plugin packages own reusable library integration baselines;
- presets explicitly select or replace plugin configuration;
- project-specific presets own application policy;
- `preset` in `createTestFramework()` accepts a single `PresetDefinition`;
- `presets` accepts a registry of named `PresetDefinition` objects;
- `preset` and `presets` are mutually exclusive;
- a single `preset` is internally treated as `default`;
- a preset registry should normally provide a `default` profile;
- factory-level `extraOptions.preset` selects a named profile from the registry;
- runtime preset selection requires a registry created through `presets`;
- runtime presets are complete profiles rather than overlays;
- `extendPreset()` composes reusable preset definitions;
- plugin configuration supplied through `extendPreset()` uses replacement semantics;
- preserving source-preset configuration requires explicitly invoking the source factory;
- starting from a plugin baseline can be done explicitly through `getDefaultOptions()`;
- manifest extensions can change plugin capability or default enablement;
- runner-specific behavior belongs in runner-specific presets;
- runner-specific presets should pass runner context to plugins rather than reproduce plugin configuration;
- `mountOptions.plugins` replaces managed plugin configuration at a local scope;
- `extraOptions.plugins` provides a targeted shallow overlay;
- mutable plugin runtime state must remain isolated between component factory invocations;
- official base and recommended presets are convenient starting environments rather than complete application-specific configurations.

For most projects, the recommended workflow is:

1. Start with the default preset from the appropriate runner-specific recommended package.

   ```typescript
   createTestFramework({
     preset: recommendedPresets.default,
   });
   ```

2. Use a single `preset` while one runtime environment is sufficient.

3. As the application grows, create a project-specific preset with `extendPreset()`.

4. Keep application routes, localization, state policy, enabled plugin composition, and other project policy in that project preset.

5. Keep scenario-specific state and one-off behavior in factory- or test-level configuration.

6. Introduce `presets` only when multiple named runtime environments are genuinely useful.

7. Add specialized presets when a distinct runtime capability boundary improves the project's test architecture.
