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
→ may expose a reusable baseline through getDefaultOptions()

TestForge-maintained preset package
→ composes reusable plugin integrations
→ may consume getDefaultOptions()

project-owned preset
→ owns its concrete plugin configuration
→ expresses that configuration explicitly
→ adds application-specific policy
```

This distinction is important.

A plugin may expose a project-independent integration baseline through `getDefaultOptions()`. TestForge-maintained preset packages can use that API when they intentionally want to track the baseline provided by the installed plugin version.

Project-owned presets should instead materialize the relevant configuration directly as `PluginOptionsFactory` functions.

For example, rather than keeping:

```typescript
defaults: {
  [I18N_PLUGIN_NAME]: i18nPlugin.getDefaultOptions(),
}
```

in project-owned source code, prefer:

```typescript
defaults: {
  [I18N_PLUGIN_NAME]: () => ({
    legacy: false,
    globalInjection: true,
  }),
}
```

This makes the project's testing environment visible, editable, and stable across changes to a plugin's `getDefaultOptions()` implementation.

For Vue projects, TestForge provides a runner-independent base package and runner-specific recommended presets:

- `@testforgejs/vue-test-preset-base`
- `@testforgejs/vue-test-preset-recommended` for Vitest
- `@testforgejs/vue-test-preset-recommended-jest` for Jest

These TestForge-maintained packages may use `getDefaultOptions()` internally.

Projects can use an official recommended preset directly, or use it as a starting point for a project-owned preset whose plugin configuration is expressed explicitly.

A preset can be used in two ways when creating a TestForge framework:

- pass a single `PresetDefinition` through `preset`;
- pass a registry of named presets through `presets`.

These options are mutually exclusive.

Use `preset` when the framework needs one runtime environment. Use `presets` when the project needs multiple named runtime profiles and runtime selection between them.

A single `preset` is internally treated as the framework's `default` preset.

> [!NOTE]
> This guide focuses on preset authoring rather than package installation.
>
> Any project or package that directly imports a TestForge plugin package must declare that plugin package as a direct dependency.
>
> For project-owned test configuration, this typically means installing the plugin package as a development dependency.
>
> See the [Getting Started Guide](./getting-started.md) for project installation and initial setup.

---

## Table of Contents

- [Preset Structure](#1-preset-structure)
- [`preset` vs `presets`](#2-preset-vs-presets)
- [The `manifest`](#3-the-manifest)
- [The `defaults`](#4-the-defaults)
- [The `default` Preset](#5-the-default-preset)
- [Specialized Presets](#6-specialized-presets)
- [Preset Composition with `extendPreset()`](#7-preset-composition-with-extendpreset)
  - [Replacing Plugin Configuration](#71-replacing-plugin-configuration)
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
2. `defaults` — defines baseline configuration factories for managed plugins.

Both properties are required.

A project-owned preset can define its runtime explicitly:

```typescript
import { vi } from "vitest";
import { createMemoryHistory } from "vue-router";
import type { PresetDefinition } from "@testforgejs/vue-test-core";
import { piniaPlugin, PLUGIN_NAME as PINIA_PLUGIN_NAME } from "@testforgejs/vue-test-plugin-pinia";
import { i18nPlugin, PLUGIN_NAME as I18N_PLUGIN_NAME } from "@testforgejs/vue-test-plugin-i18n";
import {
  routerPlugin,
  PLUGIN_NAME as ROUTER_PLUGIN_NAME,
} from "@testforgejs/vue-test-plugin-router";

const preset = {
  manifest: [
    { module: piniaPlugin, enabled: true },
    { module: i18nPlugin, enabled: true },
    { module: routerPlugin, enabled: false },
  ],

  defaults: {
    [PINIA_PLUGIN_NAME]: () => ({
      createSpy: vi.fn,
    }),

    [I18N_PLUGIN_NAME]: () => ({
      legacy: false,
      globalInjection: true,
    }),

    [ROUTER_PLUGIN_NAME]: () => ({
      history: createMemoryHistory(),
      routes: [],
    }),
  },
} satisfies PresetDefinition;
```

Preset definitions use the standardized `PLUGIN_NAME` exports as their `defaults` keys.

This keeps each plugin's exported identifier as the single source of truth instead of repeating plugin name literals in preset definitions.

The descriptive plugin export identifies the module used by the manifest, while `PLUGIN_NAME` identifies the corresponding configuration entry:

```text
plugin module
→ manifest entry

PLUGIN_NAME
→ defaults key
```

The example demonstrates three independent concepts:

```text
manifest
→ determines which plugins belong to the runtime environment

enabled
→ determines whether a declared plugin is active by default

defaults
→ determines the baseline configuration factory for each plugin
```

A plugin can therefore be declared and have baseline configuration available while still being disabled by default.

For example:

```typescript
manifest: [
  {
    module: routerPlugin,
    enabled: false,
  },
],

defaults: {
  [ROUTER_PLUGIN_NAME]: () => ({
    history: createMemoryHistory(),
    routes: [],
  }),
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

Registry keys such as `i18n` or `router` are user-defined runtime profile names. They are separate from plugin identifiers used as keys inside a preset's `defaults` object.

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

For example, if a project-owned `i18nPreset` contains only Vue I18n:

```typescript
const i18nPreset: PresetDefinition = {
  manifest: [
    {
      module: i18nPlugin,
      enabled: true,
    },
  ],

  defaults: {
    [I18N_PLUGIN_NAME]: () => ({
      legacy: false,
      globalInjection: true,
    }),
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

The `enabled` state belongs to the preset.

Providing a factory in `defaults` does not enable a plugin.

```text
plugin configuration
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
[ROUTER_PLUGIN_NAME]: () => ({
  history: createMemoryHistory(),
  routes: [],
}),
```

This separation allows a preset to make a plugin readily available without initializing it for every mount.

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

This means the plugin is part of the preset's capability boundary but is not initialized unless configuration or another activation mechanism enables it.

Whether a plugin belongs in a preset and whether it should be enabled by default are independent decisions.

Default enablement should reflect the intended runtime environment.

It should be based on the role that integration plays in the intended runtime environment rather than on whether the plugin package merely exists.

---

## 4. The `defaults`

The `defaults` object defines baseline configuration factories for managed plugins.

Each entry is a `PluginOptionsFactory`:

```typescript
defaults: {
  [PINIA_PLUGIN_NAME]: () => ({
    createSpy: vi.fn,
  }),

  [I18N_PLUGIN_NAME]: () => ({
    legacy: false,
    globalInjection: true,
  }),

  [ROUTER_PLUGIN_NAME]: () => ({
    history: createMemoryHistory(),
    routes: [],
  }),
},
```

Use the standardized `PLUGIN_NAME` export for these keys rather than repeating literals such as `"pinia"`, `"i18n"`, or `"router"`.

This keeps plugin identity owned by the plugin package while keeping the actual project configuration owned by the preset source code.

TestForge invokes these factories while resolving the active preset configuration.

Each invocation should produce fresh configuration for the current pipeline context.

### Explicit project-owned configuration

A project-owned preset should make its plugin integration baseline visible in source code.

For example:

```typescript
defaults: {
  [I18N_PLUGIN_NAME]: () => ({
    legacy: false,
    globalInjection: true,
  }),
},
```

is preferred in project-owned source over:

```typescript
defaults: {
  [I18N_PLUGIN_NAME]: i18nPlugin.getDefaultOptions(),
},
```

The explicit version has several advantages:

- the effective configuration is visible in the project;
- the user can edit it directly;
- upgrading the plugin package does not silently replace that configuration through a changed `getDefaultOptions()` implementation;
- code review can see changes to the project's test environment;
- generated project presets remain ordinary editable TypeScript rather than thin wrappers around hidden defaults.

Project-owned configuration should still remain minimal.

Explicit configuration does **not** mean reproducing every option supported by the underlying library.

For example, a generated Pinia preset may contain only:

```typescript
[PINIA_PLUGIN_NAME]: () => ({
  createSpy: vi.fn,
}),
```

Additional options such as `stubActions`, `initialState`, or other Pinia testing options can be added when the project actually wants to choose them.

### `getDefaultOptions()` in TestForge-maintained presets

Plugins may expose a project-independent baseline through `getDefaultOptions()`:

```typescript
piniaPlugin.getDefaultOptions();
i18nPlugin.getDefaultOptions();
routerPlugin.getDefaultOptions();
```

This API is intended for TestForge-maintained reusable preset packages that deliberately follow the integration baseline exported by the installed plugin version.

For example, `@testforgejs/vue-test-preset-base` can use:

```typescript
defaults: {
  [I18N_PLUGIN_NAME]: i18nPlugin.getDefaultOptions(),
  [ROUTER_PLUGIN_NAME]: routerPlugin.getDefaultOptions(),
},
```

and a Vitest-specific recommended preset can use:

```typescript
defaults: {
  [PINIA_PLUGIN_NAME]: piniaPlugin.getDefaultOptions(vi),
},
```

In these packages, following the plugin baseline is intentional.

The responsibility is:

```text
plugin package
→ defines reusable integration baseline

TestForge-maintained preset package
→ consumes that baseline

project-owned preset
→ materializes concrete configuration
```

### Plugin defaults are never implicit

Declaring a plugin:

```typescript
manifest: [
  {
    module: routerPlugin,
    enabled: true,
  },
],
```

does not implicitly apply any configuration.

A preset must still provide a configuration factory if a baseline is required.

For a project-owned preset:

```typescript
defaults: {
  [ROUTER_PLUGIN_NAME]: () => ({
    history: createMemoryHistory(),
    routes: [],
  }),
},
```

For a TestForge-maintained reusable preset package, the same baseline may instead be obtained through the plugin API:

```typescript
defaults: {
  [ROUTER_PLUGIN_NAME]: routerPlugin.getDefaultOptions(),
},
```

In other words:

```text
manifest inclusion ≠ default configuration
```

### Integration baseline vs application policy

A project-owned factory can contain both the integration choices required by TestForge and application-specific policy.

For example:

```typescript
defaults: {
  [I18N_PLUGIN_NAME]: () => ({
    legacy: false,
    globalInjection: true,

    locale: "uk",
    fallbackLocale: "uk",
    messages,
  }),
},
```

The conceptual ownership is:

```text
legacy / globalInjection
→ materialized integration baseline

locale / fallbackLocale / messages
→ project-specific application policy
```

Similarly:

```text
Pinia
→ createSpy: vi.fn
→ project may additionally choose action/state policy

Router
→ createMemoryHistory()
→ project supplies application routes

I18n
→ Vue integration mode
→ project supplies locales and translations
```

Once written into a project preset, these values are all part of project-owned source code.

### Fresh options

Preset defaults are factories rather than shared configuration objects:

```typescript
const i18nDefaults = () => ({
  legacy: false,
  globalInjection: true,
});

const first = i18nDefaults();
const second = i18nDefaults();

first !== second; // true
```

Factories can also create fresh nested runtime values.

For example:

```typescript
const routerDefaults = () => ({
  history: createMemoryHistory(),
  routes: [],
});

const first = routerDefaults();
const second = routerDefaults();

first.history !== second.history; // true
```

This prevents mutable configuration or runtime state from being unintentionally shared between independent pipeline contexts.

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

A project-specific preset should choose the enabled integrations that represent that application's component-testing runtime.

---

## 6. Specialized Presets

A preset registry can contain multiple independent runtime profiles.

For example, `@testforgejs/vue-test-preset-base` provides:

- `default`
- `piniaPreset`
- `i18nPreset`
- `routerPreset`

Projects can also define their own specialized profiles.

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
    [I18N_PLUGIN_NAME]: () => ({
      legacy: false,
      globalInjection: true,
    }),
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

This is the preferred way to reuse an existing manifest and other preset structure without copying the entire definition.

For example:

```typescript
import { extendPreset } from "@testforgejs/vue-test-core";

import { PLUGIN_NAME as I18N_PLUGIN_NAME } from "@testforgejs/vue-test-plugin-i18n";

import { presets as recommendedPresets } from "@testforgejs/vue-test-preset-recommended";

const projectPreset = extendPreset(recommendedPresets.default, {
  defaults: {
    [I18N_PLUGIN_NAME]: () => ({
      legacy: false,
      globalInjection: true,
      locale: "uk",
      fallbackLocale: "uk",
    }),
  },
});
```

The project preset reuses the composition of the recommended preset but owns the I18n configuration it explicitly replaces.

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

### 7.1. Replacing Plugin Configuration

When an extension provides a `defaults` factory for an existing plugin, that factory replaces the existing preset factory as a whole.

Suppose the source preset resolves I18n to:

```typescript
{
  legacy: false,
  globalInjection: true,
}
```

and the extension provides:

```typescript
extendPreset(basePreset, {
  defaults: {
    [I18N_PLUGIN_NAME]: () => ({
      locale: "uk",
    }),
  },
});
```

The resulting I18n configuration is:

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

from the source factory.

This replacement behavior is intentional.

It keeps preset composition explicit and prevents configuration from being silently merged across independently owned factories.

A project-owned replacement should therefore materialize every value that the project intends to preserve:

```typescript
const projectPreset = extendPreset(basePreset, {
  defaults: {
    [I18N_PLUGIN_NAME]: () => ({
      legacy: false,
      globalInjection: true,
      locale: "uk",
    }),
  },
});
```

This is preferable to spreading a source preset factory when the project wants to own a stable configuration.

For example, this is possible:

```typescript
const sourceI18n = basePreset.defaults.i18n;

const projectPreset = extendPreset(basePreset, {
  defaults: {
    [I18N_PLUGIN_NAME]: () => ({
      ...sourceI18n(),
      locale: "uk",
    }),
  },
});
```

but it has different semantics.

The project now intentionally continues to depend on the source preset's I18n factory. If that factory changes after a dependency update, the effective project configuration can change as well.

Use this form only when following the source preset is intentional.

For a project-owned stable configuration, prefer explicit materialization:

```typescript
const projectPreset = extendPreset(basePreset, {
  defaults: {
    [I18N_PLUGIN_NAME]: () => ({
      legacy: false,
      globalInjection: true,
      locale: "uk",
    }),
  },
});
```

Conceptually:

```text
spread source factory
→ continue following source preset behavior

explicit factory
→ project owns the resulting configuration
```

Project-owned presets should normally prefer the second model.

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
    [CUSTOM_PLUGIN_NAME]: () => ({
      // Explicit project-owned plugin configuration
    }),
  },
});
```

Here `CUSTOM_PLUGIN_NAME` represents the custom plugin package's standardized `PLUGIN_NAME` export.

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

This section describes **TestForge-maintained reusable preset packages**.

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

Because these packages are maintained together with the TestForge plugin integrations, they can intentionally use `getDefaultOptions()` and follow the baseline exported by the corresponding plugin version.

For Vitest:

```typescript
import { vi } from "vitest";

import { extendPreset } from "@testforgejs/vue-test-core";
import { presets as basePresets } from "@testforgejs/vue-test-preset-base";

import { piniaPlugin, PLUGIN_NAME as PINIA_PLUGIN_NAME } from "@testforgejs/vue-test-plugin-pinia";

export const presets = {
  default: extendPreset(basePresets.default, {
    defaults: {
      [PINIA_PLUGIN_NAME]: piniaPlugin.getDefaultOptions(vi),
    },
  }),

  piniaPreset: extendPreset(basePresets.piniaPreset, {
    defaults: {
      [PINIA_PLUGIN_NAME]: piniaPlugin.getDefaultOptions(vi),
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

import { piniaPlugin, PLUGIN_NAME as PINIA_PLUGIN_NAME } from "@testforgejs/vue-test-plugin-pinia";

export const presets = {
  default: extendPreset(basePresets.default, {
    defaults: {
      [PINIA_PLUGIN_NAME]: piniaPlugin.getDefaultOptions(jest),
    },
  }),

  piniaPreset: extendPreset(basePresets.piniaPreset, {
    defaults: {
      [PINIA_PLUGIN_NAME]: piniaPlugin.getDefaultOptions(jest),
    },
  }),

  i18nPreset: basePresets.i18nPreset,
  routerPreset: basePresets.routerPreset,
};
```

The important responsibility boundary is:

```text
runner-specific TestForge preset
→ knows which test runner is used

Pinia plugin
→ knows how that runner maps to Pinia testing configuration
```

The reusable preset package therefore does not reproduce Pinia integration knowledge manually.

It asks the Pinia plugin for the appropriate runner-aware baseline:

```typescript
piniaPlugin.getDefaultOptions(vi);
piniaPlugin.getDefaultOptions(jest);
```

Runner-independent plugins can continue using the configuration inherited from the base preset.

This use of `getDefaultOptions()` is intentionally different from project-owned preset authoring.

```text
TestForge-maintained reusable preset
→ follows plugin baseline

project-owned preset
→ materializes explicit configuration
```

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
      [I18N_PLUGIN_NAME]: () => ({
        legacy: false,
        globalInjection: true,
      }),
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

Notice that the registry key `i18n` is a runtime profile name, while `[I18N_PLUGIN_NAME]` is a managed plugin configuration key. They serve different purposes.

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

For example, a project-owned Vitest preset can provide:

```typescript
defaults: {
  [PINIA_PLUGIN_NAME]: () => ({
    createSpy: vi.fn,
  }),
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

The literal `pinia` key remains appropriate in these runtime APIs. `PLUGIN_NAME` constants are used when authoring preset `defaults`, not as a requirement for ordinary test configuration.

---

## 11. Creating a Project-Specific Preset

The official base and recommended presets are convenient starting points.

A project-owned preset should make the project's managed-plugin configuration explicit.

The goal is for the generated or hand-written preset file to be understandable without inspecting the implementation of `getDefaultOptions()` inside plugin packages.

A project does not need a preset registry when it only needs one runtime environment.

### Creating a preset directly

For example:

```typescript
import { vi } from "vitest";

import { createTestFramework, type PresetDefinition } from "@testforgejs/vue-test-core";

import { piniaPlugin, PLUGIN_NAME as PINIA_PLUGIN_NAME } from "@testforgejs/vue-test-plugin-pinia";

const projectPreset = {
  manifest: [
    {
      module: piniaPlugin,
      enabled: true,
    },
  ],

  defaults: {
    [PINIA_PLUGIN_NAME]: () => ({
      createSpy: vi.fn,
    }),
  },
} satisfies PresetDefinition;

const { testComponentFactory } = createTestFramework({
  preset: projectPreset,
});

export { testComponentFactory };
```

This is the simplest form of a project-specific TestForge environment.

The effective Pinia baseline is visible directly in the project:

```typescript
{
  createSpy: vi.fn,
}
```

If the project wants real Pinia actions, it can make that policy explicit:

```typescript
const projectPreset = {
  manifest: [
    {
      module: piniaPlugin,
      enabled: true,
    },
  ],

  defaults: {
    [PINIA_PLUGIN_NAME]: () => ({
      createSpy: vi.fn,
      stubActions: false,
    }),
  },
} satisfies PresetDefinition;
```

The distinction is visible in source:

```text
createSpy: vi.fn
→ TestForge/Vitest integration required by this project

stubActions: false
→ project-specific action policy
```

Both values now belong to the project preset.

### Using an existing preset as a base

When an existing recommended preset has the desired plugin composition, a project can reuse that composition with `extendPreset()` while replacing the plugin configurations it wants to own explicitly.

For example:

```typescript
import { extendPreset } from "@testforgejs/vue-test-core";

import { PLUGIN_NAME as I18N_PLUGIN_NAME } from "@testforgejs/vue-test-plugin-i18n";

import { presets as recommendedPresets } from "@testforgejs/vue-test-preset-recommended";

const projectPreset = extendPreset(recommendedPresets.default, {
  defaults: {
    [I18N_PLUGIN_NAME]: () => ({
      legacy: false,
      globalInjection: true,
      locale: "uk",
      fallbackLocale: "uk",
      messages,
    }),
  },
});
```

This allows the project to reuse preset composition while making the I18n configuration it owns visible in its own source.

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

> [!NOTE]
>
> Extending an official preset without replacing one of its `defaults` entries means that the resulting project preset continues to inherit that source factory.
>
> If the project needs that plugin configuration to remain fully project-owned and stable across changes to the source preset, replace the inherited factory with an explicit project-owned factory.

### 11.1. Project-Specific Router Configuration

Router configuration is a good example of project-owned preset policy.

A useful TestForge Router baseline is:

```typescript
{
  history: createMemoryHistory(),
  routes: [],
}
```

A project can materialize that baseline and add its own routes directly.

For example:

```typescript
import { createMemoryHistory } from "vue-router";

import { extendPreset } from "@testforgejs/vue-test-core";

import {
  routerPlugin,
  PLUGIN_NAME as ROUTER_PLUGIN_NAME,
} from "@testforgejs/vue-test-plugin-router";

import { presets as recommendedPresets } from "@testforgejs/vue-test-preset-recommended";

import HomePage from "@/views/HomePage.vue";
import UsersPage from "@/views/UsersPage.vue";

const projectPreset = extendPreset(recommendedPresets.default, {
  manifest: [
    {
      module: routerPlugin,
      enabled: true,
    },
  ],

  defaults: {
    [ROUTER_PLUGIN_NAME]: () => ({
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

Second, the project owns the Router configuration directly:

```typescript
[ROUTER_PLUGIN_NAME]: () => ({
  history: createMemoryHistory(),
  routes,
});
```

Conceptually:

```text
createMemoryHistory()
→ explicit project-owned testing baseline

application routes
→ project-specific policy
```

The resulting preset can be used directly:

```typescript
import { createTestFramework } from "@testforgejs/vue-test-core";

const { testComponentFactory } = createTestFramework({
  preset: projectPreset,
});
```

If another history implementation is part of the project's testing policy, replace it explicitly:

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
    [ROUTER_PLUGIN_NAME]: () => ({
      history: createWebHistory(),
      routes,
    }),
  },
});
```

The complete Router behavior chosen by the project remains visible in the project preset.

> [!NOTE]
> Router configuration is particularly likely to be project-specific because routes reference application paths and components. Application routes generally belong in a project-specific preset rather than in an official base or recommended preset.

---

## 12. Preset Design Guidelines

### 12.1. Keep TestForge base presets runner-independent

Do not place Vitest- or Jest-specific configuration directly into `@testforgejs/vue-test-preset-base`.

The TestForge-maintained base preset can use runner-independent plugin defaults:

```typescript
piniaPlugin.getDefaultOptions();
```

while runner-specific TestForge preset packages can supply their runner:

```typescript
piniaPlugin.getDefaultOptions(vi);
```

This guideline applies to the TestForge-maintained preset package hierarchy.

A project-owned preset should instead materialize the runner-specific configuration it actually uses:

```typescript
[PINIA_PLUGIN_NAME]: () => ({
  createSpy: vi.fn,
}),
```

### 12.2. Prefer composition over duplication

If an existing preset has the plugin composition the project needs, `extendPreset()` can reuse that structure.

Avoid copying a complete manifest unnecessarily.

At the same time, do not use composition as a reason to hide project-owned plugin configuration.

A project can reuse the preset structure while explicitly replacing the relevant `defaults` factories.

### 12.3. Remember replacement semantics

Providing a new plugin factory through `extendPreset()` replaces that plugin's existing preset factory.

For example:

```typescript
const projectPreset = extendPreset(basePreset, {
  defaults: {
    [I18N_PLUGIN_NAME]: () => ({
      legacy: false,
      globalInjection: true,
      locale: "uk",
    }),
  },
});
```

The extension replaces the source I18n factory as a whole.

No automatic merge occurs.

If a project instead invokes and spreads the source factory:

```typescript
const sourceI18n = basePreset.defaults.i18n;

const projectPreset = extendPreset(basePreset, {
  defaults: {
    [I18N_PLUGIN_NAME]: () => ({
      ...sourceI18n(),
      locale: "uk",
    }),
  },
});
```

the project intentionally continues to depend on that source factory.

That can be useful, but it means dependency updates may change the effective project configuration.

For a stable project-owned preset, prefer explicitly materializing the values the project intends to preserve.

### 12.4. Prefer explicit project-owned defaults

In project-owned presets, prefer explicit factories:

```typescript
defaults: {
  [ROUTER_PLUGIN_NAME]: () => ({
    history: createMemoryHistory(),
    routes: [],
  }),
}
```

over:

```typescript
defaults: {
  [ROUTER_PLUGIN_NAME]: routerPlugin.getDefaultOptions(),
}
```

The explicit form makes the project's effective testing configuration visible and prevents a future change to `getDefaultOptions()` from silently changing that project preset.

This does not mean copying every option supported by Vue Router, Pinia, Vue I18n, or another integrated library.

Materialize only the integration baseline and policies the project intentionally owns.

For example:

```typescript
[PINIA_PLUGIN_NAME]: () => ({
  createSpy: vi.fn,
}),
```

is preferable to generating a large object containing every optional Pinia testing setting.

The plugin package remains the owner of the plugin identifier through `PLUGIN_NAME`.

The project preset owns its concrete configuration.

### 12.5. Keep integration baseline and application policy understandable

A project preset may contain both:

- values required to establish the chosen TestForge integration;
- values that express project-specific application policy.

Keep that distinction understandable in source.

For example:

```typescript
[I18N_PLUGIN_NAME]: () => ({
  legacy: false,
  globalInjection: true,

  locale: "uk",
  messages,
}),
```

Conceptually:

```text
legacy / globalInjection
→ integration baseline chosen by the project

locale / messages
→ application policy
```

Both are explicit because both affect the project's runtime environment.

### 12.6. Keep defaults minimal

Preset defaults should establish the runtime environment, not encode every test scenario.

Avoid putting large mutable test fixtures into global preset configuration.

Scenario-specific state generally belongs in factory- or test-level configuration.

Similarly, do not enumerate optional library settings only to document that they exist.

Generated project presets should remain concise configuration files rather than API references.

### 12.7. Preserve upstream behavior by omitting unnecessary options

Explicit project ownership does not require explicitly setting every upstream option.

If the project does not need to choose a particular behavior, omit that option and allow the underlying library's normal behavior to apply.

For example:

```typescript
[PINIA_PLUGIN_NAME]: () => ({
  createSpy: vi.fn,
}),
```

does not need to also specify:

```typescript
stubActions;
stubPatch;
stubReset;
fakeApp;
```

unless the project intentionally wants to control those behaviors.

This keeps project presets explicit without making them unnecessarily coupled to the complete upstream option surface.

### 12.8. Keep runtime environments isolated

A preset should not cause mutable runtime state to be unintentionally shared between independent pipeline contexts.

This is particularly important for stateful integrations such as:

- Pinia;
- Vue Router history;
- Vue I18n runtime state.

Use options factories that create fresh values where required.

For example:

```typescript
[ROUTER_PLUGIN_NAME]: () => ({
  history: createMemoryHistory(),
  routes,
}),
```

creates a new history instance each time the preset factory is resolved.

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
    [ROUTER_PLUGIN_NAME]: () => ({
      history: createMemoryHistory(),
      routes: [],
    }),
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

Plugin configuration and plugin enablement are separate concerns.

Whether a plugin should be active by default depends on the runtime profile the preset is trying to represent.

A broadly shared integration may reasonably be enabled in a convenience preset.

A contextual integration may be declared but disabled.

A project-specific preset should choose the enabled set that best represents that application's component runtime.

### 12.12. Treat official presets as starting points

Official base and recommended presets provide a convenient way to adopt TestForge quickly:

```typescript
createTestFramework({
  preset: recommendedPresets.default,
});
```

As an application grows, it can define a project-specific preset whose configuration is visible and editable in the project:

```typescript
createTestFramework({
  preset: projectPreset,
});
```

That project preset is the natural place for:

- explicit plugin integration configuration;
- application routes;
- localization;
- state policy;
- plugin enablement;
- themes;
- other project-specific behavior.

---

## 13. Recommended Package Strategy

For TestForge-maintained reusable Vue testing infrastructure, the package structure is:

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

These packages are different from project-owned presets.

### TestForge-maintained base preset

`@testforgejs/vue-test-preset-base` should:

- compose runner-independent managed plugins;
- choose their default enabled state;
- use standardized plugin identifiers through `PLUGIN_NAME`;
- consume project-independent plugin baselines through `getDefaultOptions()`;
- avoid test-runner-specific configuration.

For example:

```typescript
defaults: {
  [I18N_PLUGIN_NAME]: i18nPlugin.getDefaultOptions(),
  [ROUTER_PLUGIN_NAME]: routerPlugin.getDefaultOptions(),
},
```

### TestForge-maintained runner presets

`@testforgejs/vue-test-preset-recommended` and `@testforgejs/vue-test-preset-recommended-jest` should:

- reuse the base preset composition;
- add runner context only where required;
- keep library-specific integration knowledge inside plugin packages.

For example:

```text
recommended
→ supplies vi

Pinia plugin
→ converts vi into Pinia testing configuration
```

through:

```typescript
[PINIA_PLUGIN_NAME]: piniaPlugin.getDefaultOptions(vi)
```

rather than manually reproducing the Pinia integration baseline.

This is intentional because these packages are maintained together as part of TestForge.

### Project-owned presets

A project can use an official recommended preset directly:

```typescript
createTestFramework({
  preset: recommendedPresets.default,
});
```

If the project creates its own preset, its plugin configuration should normally be explicit:

```typescript
const projectPreset = {
  manifest: [
    {
      module: piniaPlugin,
      enabled: true,
    },
  ],

  defaults: {
    [PINIA_PLUGIN_NAME]: () => ({
      createSpy: vi.fn,
    }),
  },
} satisfies PresetDefinition;
```

or:

```typescript
const projectPreset = extendPreset(recommendedPresets.default, {
  defaults: {
    [I18N_PLUGIN_NAME]: () => ({
      legacy: false,
      globalInjection: true,
      locale: "uk",
      messages,
    }),
  },
});
```

The distinction is:

```text
TestForge-maintained preset package
→ may follow plugin getDefaultOptions()

project-owned preset
→ owns explicit configuration
```

This is also the intended model for presets generated by the TestForge CLI.

The CLI should generate ordinary editable TypeScript with materialized plugin configuration rather than leaving `getDefaultOptions()` calls in the generated project file.

A named preset registry should be introduced only when the project actually benefits from multiple independent runtime environments.

---

## 14. Summary

A TestForge preset defines a complete managed-plugin runtime environment.

The key principles are:

- `PresetDefinition` contains a `manifest` and a required `defaults` object;
- `manifest` defines the plugin capability boundary;
- preset `defaults` keys should use the standardized `PLUGIN_NAME` exports from plugin packages;
- the manifest also defines each plugin's default enabled state;
- a plugin may be declared without a corresponding `defaults` entry;
- a `defaults` entry does not enable a plugin;
- preset defaults are `PluginOptionsFactory` functions rather than shared configuration objects;
- options factories should produce fresh configuration for independent pipeline contexts;
- plugin packages own stable plugin identifiers and reusable integration knowledge;
- TestForge-maintained preset packages may consume reusable plugin baselines through `getDefaultOptions()`;
- `getDefaultOptions()` is used by `vue-test-preset-base`, `vue-test-preset-recommended`, and `vue-test-preset-recommended-jest` to keep official preset integration aligned with plugin packages;
- project-owned presets should normally express their plugin configuration explicitly rather than calling `getDefaultOptions()`;
- generated project presets should materialize the relevant integration baseline into editable TypeScript;
- explicit project configuration should remain minimal and should not enumerate every optional upstream setting;
- project-owned configuration remains stable unless the project changes it;
- project presets may combine integration baseline values with application-specific policy;
- `preset` in `createTestFramework()` accepts a single `PresetDefinition`;
- `presets` accepts a registry of named `PresetDefinition` objects;
- `preset` and `presets` are mutually exclusive;
- a single `preset` is internally treated as `default`;
- a preset registry should normally provide a `default` profile;
- preset registry keys are runtime profile names and are independent of plugin identifiers;
- factory-level `extraOptions.preset` selects a named profile from the registry;
- runtime preset selection requires a registry created through `presets`;
- runtime presets are complete profiles rather than overlays;
- `extendPreset()` composes reusable preset definitions;
- plugin configuration supplied through `extendPreset()` uses replacement semantics;
- spreading a source preset factory intentionally keeps the project coupled to that source factory;
- explicitly materializing configuration transfers ownership of that configuration to the project;
- manifest extensions can change plugin capability or default enablement;
- runner-specific behavior in official TestForge presets belongs in runner-specific preset packages;
- official runner-specific presets should pass runner context to plugins rather than reproduce plugin integration knowledge;
- `mountOptions.plugins` replaces managed plugin configuration at a local scope;
- `extraOptions.plugins` provides a targeted shallow overlay;
- runtime `plugins` keys remain the normal consumer-facing configuration API;
- mutable plugin runtime state must remain isolated between component factory invocations;
- official base and recommended presets are convenient starting environments;
- project-owned presets are the place where the project's chosen testing configuration becomes explicit.

For most projects, the recommended workflow is:

1. Start with the default preset from the appropriate runner-specific recommended package.

   ```typescript
   createTestFramework({
     preset: recommendedPresets.default,
   });
   ```

2. Use a single `preset` while one runtime environment is sufficient.

3. When the project needs to own its testing configuration explicitly, create a project-specific preset.

4. Materialize the relevant plugin configuration directly in that project preset.

   ```typescript
   defaults: {
     [PINIA_PLUGIN_NAME]: () => ({
       createSpy: vi.fn,
     }),
   }
   ```

5. Keep application routes, localization, state policy, enabled plugin composition, and other project policy in the project preset.

6. Keep scenario-specific state and one-off behavior in factory- or test-level configuration.

7. Introduce `presets` only when multiple named runtime environments are genuinely useful.

8. Add specialized presets when a distinct runtime capability boundary improves the project's test architecture.
