# 🏗️ Architectural Overview: The Plugin & Preset Matrix

`@testforgejs/vue-test-core` implements a **strict microkernel architecture**. The core engine is completely blind: it has zero internal knowledge of Pinia, Vue Router, Vue I18n, Vuetify, or any other Vue ecosystem library. It contains no global plugin registry and no hardcoded plugin configurations.

Instead, the testing environment is assembled from **plugins**, **presets**, and a hierarchical **state layering pipeline**.

> [!NOTE]
>
> **TestForge architecture**
>
> - **Core** defines the runtime and configuration pipeline.
> - **Plugins** define integrations with Vue ecosystem libraries.
> - **Base presets** compose reusable, runner-independent TestForge environments and may consume plugin-provided defaults.
> - **Runner-specific recommended presets** add behavior required by a particular test runner and may consume runner-aware plugin defaults.
> - **Project-owned presets** define concrete application testing environments with explicit project-owned configuration.
> - **The host application** provides the actual Vue ecosystem dependencies used by the application and its tests.
>
> This separation allows reusable TestForge integration knowledge to evolve independently while keeping project-owned test configuration visible and editable in the consuming project.

---

## Presets as Runtime Environment Profiles

A preset in TestForge is not just a collection of convenient defaults.

It acts as:

- **A Runtime Environment Profile:** It defines which parts of the application's managed testing environment are available and active.
- **A Plugin Capability Boundary:** It defines exactly which managed plugins can be configured. If a plugin is not declared in the active preset manifest, configuration for that plugin is invalid.
- **A Plugin Configuration Source:** It provides the baseline configuration factories used to create managed plugin environments.

A preset defines two critical fields:

- `manifest` — declares **which managed plugins are registered and available in the runtime environment**;
- `defaults` — declares **how baseline configuration for those plugins is created**.

The `defaults` field contains **plugin options factories** rather than shared plugin configuration objects.

TestForge invokes these factories while resolving a preset so that each pipeline context receives its own plugin configuration.

### Preset Structure Example

A project-owned preset can define its runtime environment directly:

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

const projectPreset = {
  manifest: [
    {
      module: piniaPlugin,
      enabled: true,
    },
    {
      module: i18nPlugin,
      enabled: true,
    },
    {
      module: routerPlugin,
      enabled: false,
    },
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

The `manifest` establishes the managed plugin capability boundary.

The `defaults` object provides baseline configuration for plugins in that environment.

The two responsibilities are independent:

```text
manifest
→ plugin capability
→ default activation state

defaults
→ baseline plugin configuration
```

A plugin may therefore be declared and disabled while still having baseline configuration available:

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

Similarly, a plugin may be declared without a `defaults` entry when the preset does not need to provide baseline configuration for it.

### Plugin Identifiers

Plugin packages expose a standardized `PLUGIN_NAME` identifier.

Preset definitions use that identifier as the corresponding `defaults` key:

```typescript
defaults: {
  [PINIA_PLUGIN_NAME]: () => ({
    createSpy: vi.fn,
  }),
}
```

This avoids repeating plugin-name literals in preset definitions.

Conceptually:

```text
plugin.getName()
        │
        ▼
   PLUGIN_NAME
        │
        ▼
preset defaults key
```

The plugin package remains the source of truth for plugin identity.

---

## `defaults` as Plugin Options Factories

Preset plugin defaults are defined as `PluginOptionsFactory` functions rather than shared configuration objects.

For example:

```typescript
defaults: {
  [PINIA_PLUGIN_NAME]: () => ({
    createSpy: vi.fn,
    stubActions: false,
  }),
}
```

TestForge invokes the factory when resolving the preset configuration for a pipeline context.

Each invocation therefore receives a fresh plugin options object.

This is important for plugins whose configuration may contain mutable or stateful nested values, such as:

- Pinia state;
- Vue Router history;
- Vue Router route collections;
- Vue I18n messages;
- other plugin-specific mutable values.

A preset should therefore not define plugin defaults as a shared object:

```typescript
defaults: {
  [PINIA_PLUGIN_NAME]: {
    initialState: {},
  },
}
```

Instead, define them as a factory:

```typescript
defaults: {
  [PINIA_PLUGIN_NAME]: () => ({
    initialState: {},
  }),
}
```

For example:

```typescript
const defaultI18n = () => ({
  legacy: false,
  globalInjection: true,
});

const first = defaultI18n();
const second = defaultI18n();

first !== second; // true
```

Each call creates a separate options object.

Factories can also create fresh nested runtime values:

```typescript
const defaultRouter = () => ({
  history: createMemoryHistory(),
  routes: [],
});

const first = defaultRouter();
const second = defaultRouter();

first.history !== second.history; // true
```

This prevents mutable plugin configuration and runtime state from being unintentionally shared between independent pipeline contexts.

Plugin-specific option types can be applied directly to the returned configuration:

```typescript
[PINIA_PLUGIN_NAME]: () =>
  ({
    createSpy: vi.fn,
    stubActions: false,
  }) satisfies VueTestPiniaOptions,
```

This keeps preset definitions strongly typed while preserving the factory-based configuration model.

---

## Project-Owned Presets

A project-owned preset is a complete runtime environment definition maintained by the consuming project.

It should normally make the concrete plugin configuration selected by that project visible directly in source.

For example:

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

import HomeStub from "./stubs/HomeStub.vue";
import UsersStub from "./stubs/UsersStub.vue";

export const projectPreset = {
  manifest: [
    {
      module: piniaPlugin,
      enabled: true,
    },
    {
      module: i18nPlugin,
      enabled: true,
    },
    {
      module: routerPlugin,
      enabled: true,
    },
  ],

  defaults: {
    [PINIA_PLUGIN_NAME]: () => ({
      createSpy: vi.fn,
    }),

    [I18N_PLUGIN_NAME]: () => ({
      legacy: false,
      globalInjection: true,
      locale: "uk",
      fallbackLocale: "uk",
      messages: {
        uk: {
          welcome: "Вітаємо",
        },
      },
    }),

    [ROUTER_PLUGIN_NAME]: () => ({
      history: createMemoryHistory(),
      routes: [
        {
          path: "/",
          component: HomeStub,
        },
        {
          path: "/users",
          component: UsersStub,
        },
      ],
    }),
  },
} satisfies PresetDefinition;
```

This model gives the project direct ownership of its testing environment.

### Configuration Visibility

The effective configuration is visible without inspecting another preset or the implementation of a plugin's `getDefaultOptions()` function.

For example:

```typescript
[PINIA_PLUGIN_NAME]: () => ({
  createSpy: vi.fn,
}),
```

makes the project's Pinia runner integration explicit.

Likewise:

```typescript
[ROUTER_PLUGIN_NAME]: () => ({
  history: createMemoryHistory(),
  routes,
}),
```

makes the project's Router environment explicit.

### Configuration Stability

A materialized project-owned preset does not automatically follow future changes to TestForge preset defaults.

For example, changing:

```text
@testforgejs/vue-test-plugin-pinia
```

or:

```text
@testforgejs/vue-test-preset-recommended
```

does not rewrite:

```typescript
[PINIA_PLUGIN_NAME]: () => ({
  createSpy: vi.fn,
}),
```

inside the project.

The project's configuration changes when the project changes it.

Conceptually:

```text
TestForge dependency update
        │
        ▼
plugin implementation may evolve
official presets may evolve

project-owned materialized configuration
        │
        └── remains explicit project source
```

This reduces the risk that an upstream TestForge configuration change silently alters the project's effective testing environment.

### Explicit Does Not Mean Exhaustive

Project ownership does not require specifying every option supported by the integrated library.

For example:

```typescript
[PINIA_PLUGIN_NAME]: () => ({
  createSpy: vi.fn,
}),
```

does not need to enumerate:

```text
stubActions
stubPatch
stubReset
fakeApp
initialState
...
```

unless the project intentionally wants to control those options.

The goal is **explicit project-owned configuration**, not duplication of the underlying library's complete API.

### CLI-Generated Presets

The intended CLI model follows the same architecture.

A generated project preset should be ordinary editable TypeScript containing materialized plugin configuration:

```text
plugin integration knowledge
        │
        ▼
       CLI
        │
        ▼
generated PresetDefinition
        │
        ▼
project-owned source code
```

After generation, the preset belongs to the project.

The user can inspect, edit, version, review, and evolve it like any other project configuration file.

The generated preset should not require the project to depend on hidden `getDefaultOptions()` behavior for the configuration it owns.

---

## Base Presets, Recommended Presets, and Applications

TestForge also provides reusable preset packages.

These presets have a different ownership model from project-owned presets.

### Base Presets

A base preset provides reusable runner-independent plugin composition and configuration.

For example:

```text
@testforgejs/vue-test-preset-base
```

The TestForge-maintained base preset may consume reusable plugin baselines through `getDefaultOptions()`.

For example:

```typescript
defaults: {
  [I18N_PLUGIN_NAME]: i18nPlugin.getDefaultOptions(),
  [ROUTER_PLUGIN_NAME]: routerPlugin.getDefaultOptions(),
}
```

This is intentional.

The base preset and TestForge plugin packages are maintained as part of the same reusable infrastructure, so the base preset can deliberately follow the integration baseline provided by the installed plugin version.

Conceptually:

```text
plugin
→ reusable integration knowledge
→ getDefaultOptions()

base preset
→ consumes runner-independent plugin baseline
```

The base preset should avoid dependencies on a particular test runner whenever possible.

### Runner-Specific Recommended Presets

Runner-specific recommended presets add behavior required by a particular test runner.

For example:

```text
@testforgejs/vue-test-preset-recommended
@testforgejs/vue-test-preset-recommended-jest
```

The Vitest preset can ask the Pinia plugin for its runner-aware baseline:

```typescript
defaults: {
  [PINIA_PLUGIN_NAME]: piniaPlugin.getDefaultOptions(vi),
}
```

The Jest preset can do the same with Jest:

```typescript
defaults: {
  [PINIA_PLUGIN_NAME]: piniaPlugin.getDefaultOptions(jest),
}
```

This keeps two responsibilities separate:

```text
recommended preset
→ knows which runner is used

Pinia plugin
→ knows how that runner maps to Pinia integration
```

The recommended preset therefore does not need to reproduce the Pinia integration baseline manually.

Like the base preset, a TestForge-maintained recommended preset intentionally follows the plugin baseline it references.

### Host Application

The host application remains responsible for:

- its Vue ecosystem dependencies;
- its application routes;
- its localization data;
- its state policy;
- its application-specific plugins;
- its project-owned TestForge configuration.

A project can use an official recommended preset directly:

```typescript
createTestFramework({
  preset: recommendedPresets.default,
});
```

or define its own independent project-owned preset:

```typescript
createTestFramework({
  preset: projectPreset,
});
```

These are different ownership models:

```text
official TestForge preset
→ reusable TestForge-owned environment
→ may follow plugin baseline changes

project-owned preset
→ application-owned environment
→ normally materializes concrete configuration
```

A project-owned preset does not need to be derived from an official preset.

---

## Preset Composition

Presets can optionally be composed using `extendPreset()`.

`extendPreset()` is useful when a project or reusable package intentionally wants to reuse an existing preset's manifest and configuration rather than define a completely independent preset.

For example:

```typescript
import { vi } from "vitest";
import { extendPreset } from "@testforgejs/vue-test-core";
import { PLUGIN_NAME as PINIA_PLUGIN_NAME } from "@testforgejs/vue-test-plugin-pinia";
import { presets as recommendedPresets } from "@testforgejs/vue-test-preset-recommended";

const projectPreset = extendPreset(recommendedPresets.default, {
  defaults: {
    [PINIA_PLUGIN_NAME]: () => ({
      createSpy: vi.fn,
      stubActions: false,
    }),
  },
});
```

The resulting preset is a new complete runtime environment profile.

It reuses the source preset for configuration that is not replaced by the extension.

This is the key trade-off:

```text
direct PresetDefinition
→ independent project-owned configuration

extendPreset(sourcePreset, ...)
→ reuse source preset
→ intentional dependency on non-replaced source configuration
```

`extendPreset()` operates at **preset-definition time**.

It does not create inheritance between runtime configuration layers used by individual factory invocations.

> [!IMPORTANT]
>
> `extendPreset()` is a **preset composition mechanism**, not a runtime configuration overlay.
>
> The resulting preset remains a complete runtime environment definition.
>
> Runtime test-specific changes should instead use `mountOptions.plugins` or `extraOptions.plugins`.

### Explicit Plugin Configuration Replacement

When an extension provides configuration for an existing plugin, that plugin's default configuration is **replaced as a whole**.

TestForge does not deep-merge plugin configuration between the source preset and the extension.

For example, if the source preset contains:

```typescript
defaults: {
  [PINIA_PLUGIN_NAME]: () => ({
    createSpy: vi.fn,
    stubActions: true,
  }),
}
```

and the extension provides:

```typescript
defaults: {
  [PINIA_PLUGIN_NAME]: () => ({
    createSpy: vi.fn,
    stubActions: false,
  }),
}
```

the resulting preset uses:

```typescript
{
  createSpy: vi.fn,
  stubActions: false,
}
```

The source Pinia factory is replaced.

Replacement semantics are intentional.

A plugin configuration selected by the extension does not silently acquire options from the source factory.

### Preserving Source Factory Configuration

Because preset defaults are factories, an extension can explicitly invoke a source factory when following the source configuration is intentional.

For example:

```typescript
const sourcePinia = recommendedPresets.default.defaults.pinia;

const projectPreset = extendPreset(recommendedPresets.default, {
  defaults: {
    [PINIA_PLUGIN_NAME]: () => ({
      ...sourcePinia(),
      stubActions: false,
    }),
  },
});
```

This creates fresh source configuration before applying the additional project-specific option.

However, this has an important architectural consequence:

```text
source factory changes
        │
        ▼
effective project configuration may change
```

The project intentionally remains coupled to that source preset factory.

This can be useful when tracking the source preset is desired.

It should not be confused with materialized project ownership.

Compare:

```text
...sourcePreset.defaults.pinia()
→ follow source preset behavior

createSpy: vi.fn
→ project owns this concrete choice
```

For project-owned presets where configuration visibility and stability are the priority, explicit materialization is normally preferable.

### Extending the Plugin Manifest

An extension can also change the managed plugin environment.

For example:

```typescript
const extendedPreset = extendPreset(basePreset, {
  manifest: [
    {
      module: customPlugin,
      enabled: true,
    },
  ],

  defaults: {
    [CUSTOM_PLUGIN_NAME]: () => ({
      // explicit plugin configuration
    }),
  },
});
```

A manifest extension can:

- add a managed plugin;
- change the default enabled state of a plugin supported by the source preset;
- accompany a plugin with an explicit `defaults` factory when baseline configuration is required.

`manifest` and `defaults` remain separate responsibilities:

```text
manifest
→ capability + activation

defaults
→ plugin configuration
```

Changing one does not implicitly change the other.

Preset extensions are validated before the resulting preset is created.

Invalid preset definitions are rejected before they reach the runtime pipeline.

---

## ⚠️ Preset Runtime Boundaries

Presets define the complete managed plugin environment for a factory invocation.

A preset is supplied through the configuration used to create the TestForge framework.

The framework supports two mutually exclusive forms:

- `preset` — provides a single `PresetDefinition`;
- `presets` — provides a named registry of `TestFrameworkPresets`.

For example, a framework can be created with a single project-owned preset:

```typescript
createTestFramework({
  preset: projectPreset,
});
```

or with a registry containing multiple runtime profiles:

```typescript
createTestFramework({
  presets: projectPresets,
});
```

These two options define different framework configuration modes and cannot be used together.

### Selecting a Preset at Factory Invocation Time

When a framework is created with a preset registry, `extraOptions.preset` selects one of the named profiles from that registry for the current factory invocation:

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

This is different from the `preset` option passed to `createTestFramework()`.

In other words:

```text
createTestFramework({ preset })
→ provides one runtime environment

createTestFramework({ presets })
→ provides a named collection of runtime environments

extraOptions.preset
→ selects one registered runtime environment
```

`extraOptions.preset` therefore applies only when the framework was created with `presets`.

### Runtime Capability Boundary

The selected preset defines the complete managed plugin environment for the current factory invocation.

If a plugin is not declared in the active preset manifest, configuring it is invalid.

For example:

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
    preset: "i18nPreset",
  },
);
```

If `i18nPreset` declares only I18n, the framework rejects the Pinia configuration.

This guarantees that an active preset behaves as an isolated runtime environment rather than as a partial configuration overlay.

The selected preset does not inherit plugins from another runtime profile, including the registry's `default` preset.

### Preset Composition vs Runtime Configuration

Preset composition and runtime configuration are separate stages:

- `extendPreset()` constructs a new preset definition before the framework runtime is created;
- `createTestFramework({ preset })` supplies a single complete runtime environment;
- `createTestFramework({ presets })` supplies a named collection of complete runtime environments;
- `extraOptions.preset` selects one named preset for a factory invocation;
- `mountOptions.plugins` and `extraOptions.plugins` modify managed plugin configuration within the selected runtime environment.

These mechanisms should not be treated as equivalent forms of inheritance.

**Important:** If `mountOptions.plugins` or `extraOptions.plugins` contains configuration for a plugin that is **not declared** in the active preset's manifest, the framework throws a validation error.

---

## Presets and the Runtime Configuration Pipeline

Preset defaults provide the initial managed-plugin configuration for the selected runtime environment.

Once a preset has been selected, TestForge resolves more local configuration through the factory invocation.

Conceptually:

```text
Preset definition
      │
      │ selects manifest + default factories
      ▼
Preset defaults
      │
      ▼
defaultMountOptions
      │
      ▼
mountOptions
      │
      ▼
extraOptions.plugins
      │
      ▼
Resolved runtime environment
      │
      ▼
Vue Test Utils mount
```

The layers do not all use the same merge strategy.

In particular:

- preset defaults establish the baseline configuration;
- `defaultMountOptions.plugins` replaces the corresponding managed plugin configuration at the factory-default layer;
- `mountOptions.plugins` replaces the corresponding managed plugin configuration at the mount layer;
- `extraOptions.plugins` provides a shallow overlay on the already resolved managed plugin configuration.

This distinction allows TestForge to combine stable runtime profiles with explicit test-specific configuration without turning every configuration layer into implicit deep inheritance.

For example, a project preset may define:

```typescript
[PINIA_PLUGIN_NAME]: () => ({
  createSpy: vi.fn,
})
```

while one test applies:

```typescript
plugins: {
  pinia: {
    stubActions: false,
  },
}
```

through `extraOptions.plugins`.

The preset owns the baseline.

The test expresses only its local delta.

---

## Framework Configuration: Single Preset vs Preset Registry

A TestForge framework can be initialized with either a single preset or a registry of named presets.

For a project that needs only one runtime environment, provide a single `PresetDefinition`:

```typescript
const { testComponentFactory } = createTestFramework({
  preset: projectPreset,
});
```

The framework treats this preset as its `default` runtime environment.

When a project needs multiple runtime environments, provide a `TestFrameworkPresets` registry instead:

```typescript
const { testComponentFactory } = createTestFramework({
  presets: {
    default: projectPreset,
    router: routerPreset,
  },
});
```

The two forms are mutually exclusive.

A framework configuration must not provide both:

```typescript
// Invalid
createTestFramework({
  preset: projectPreset,
  presets: projectPresets,
});
```

This distinction allows the common single-environment case to remain simple while preserving named runtime profiles for projects that need them.

A single `preset` is conceptually equivalent to a registry containing that preset under the `default` name:

```typescript
createTestFramework({
  preset: projectPreset,
});
```

is equivalent in runtime terms to:

```typescript
createTestFramework({
  presets: {
    default: projectPreset,
  },
});
```

The two forms differ in how the framework configuration exposes available runtime environments.

Once the framework has been created with a registry, a factory invocation can select a named preset through `extraOptions.preset`:

```typescript
factory(
  {},
  {},
  {},
  {
    preset: "router",
  },
);
```

When a framework is created with a single `preset`, that preset is the framework's default environment and no named preset registry is required.

---

## Architectural Design Principles

### 1. Keep the Core Blind

The core engine must remain unaware of specific Vue ecosystem libraries.

Plugin-specific behavior belongs in plugin packages.

This prevents the core runtime from becoming coupled to individual libraries.

### 2. Treat the Manifest as a Capability Boundary

The manifest defines which managed plugins exist in a runtime environment.

A plugin that is not declared in the active manifest cannot be configured through the managed `plugins` API.

This makes invalid configuration detectable during validation rather than silently ignored.

### 3. Use Factories for Preset Defaults

Preset defaults should be represented by `PluginOptionsFactory` functions.

Factories provide fresh plugin options for each pipeline context and prevent mutable configuration from being shared between independent runtime environments.

### 4. Prefer Explicit Ownership for Project Presets

Project-owned presets should normally make their concrete plugin configuration explicit.

Prefer:

```typescript
[PINIA_PLUGIN_NAME]: () => ({
  createSpy: vi.fn,
})
```

when the project intends to own that configuration.

This keeps the effective runtime visible in project source and prevents unrelated changes to TestForge preset defaults from silently changing materialized project configuration.

`extendPreset()` remains useful when reuse of another preset is intentional.

### 5. Treat Preset Composition as Intentional Coupling

Using:

```typescript
extendPreset(sourcePreset, extension);
```

means that configuration not replaced by the extension continues to come from `sourcePreset`.

Invoking a source factory explicitly:

```typescript
...sourcePreset.defaults.pinia()
```

creates an even more direct dependency on that source factory.

Use composition when following the source preset is desirable.

Use explicit materialization when project ownership and configuration stability are the priority.

### 6. Keep Replacement Semantics Explicit

When `extendPreset()` replaces a plugin's defaults, it replaces that plugin configuration as a whole.

No implicit deep merge occurs.

This keeps the resulting preset predictable.

If source configuration is intentionally preserved, that dependency should be expressed explicitly by invoking the source factory.

### 7. Separate Preset Composition from Runtime Configuration

`extendPreset()` constructs preset definitions.

Runtime options such as `mountOptions.plugins` and `extraOptions.plugins` configure individual component factory contexts.

These mechanisms operate at different architectural stages and should not be treated as interchangeable forms of inheritance.

### 8. Keep Reusable TestForge Defaults Minimal

TestForge-maintained base and recommended presets should establish reusable testing infrastructure rather than encode application-specific scenarios.

Application-specific routes, messages, state, themes, and other domain configuration belong in project-owned presets or local test configuration.

### 9. Keep Runtime Environments Isolated

A preset should not cause mutable plugin runtime instances to be shared between independent factory invocations.

Plugin integrations should create independent runtime state for each mount.

This is particularly important for stateful integrations such as:

- Pinia;
- Vue Router history;
- Vue I18n runtime state.

### 10. Keep Runner-Specific Behavior in Runner-Specific TestForge Presets

Runner-independent reusable infrastructure belongs in the base preset.

Vitest- or Jest-specific reusable behavior belongs in the corresponding TestForge-maintained recommended preset.

Project-owned presets may materialize their chosen runner-specific configuration directly:

```typescript
[PINIA_PLUGIN_NAME]: () => ({
  createSpy: vi.fn,
})
```

### 11. Keep Application Dependencies in the Host Application

TestForge plugins define how ecosystem libraries integrate with the testing runtime.

The host application supplies:

- the actual ecosystem dependencies;
- application routes;
- localization data;
- state policy;
- themes;
- application-specific plugins;
- project-owned TestForge configuration.

This keeps reusable TestForge infrastructure independent from any single application's architecture.

---

## Summary

TestForge uses a strict microkernel architecture in which the core runtime is independent of the Vue ecosystem libraries it orchestrates.

The key principles are:

- **Core** defines the runtime and configuration pipeline.
- **Plugins** define integrations with Vue ecosystem libraries.
- **Presets** define complete managed-plugin runtime environment profiles.
- `manifest` defines the managed plugin capability boundary and default activation state.
- `defaults` contains `PluginOptionsFactory` functions rather than shared plugin option objects.
- Preset `defaults` keys use standardized plugin identifiers exported through `PLUGIN_NAME`.
- Each plugin options factory invocation produces fresh configuration.
- TestForge-maintained base presets may consume runner-independent plugin baselines through `getDefaultOptions()`.
- TestForge-maintained runner-specific presets may consume runner-aware plugin baselines through `getDefaultOptions(vi)` or `getDefaultOptions(jest)`.
- Project-owned presets normally materialize concrete plugin configuration directly in project source.
- Materialized project configuration remains visible, editable, reviewable, and stable until the project changes it.
- Explicit project ownership does not require enumerating every upstream plugin option.
- CLI-generated presets follow the same project-owned model and produce ordinary editable TypeScript.
- A project-owned preset does not need to extend an official TestForge preset.
- `extendPreset()` is an optional preset composition mechanism.
- Configuration inherited through `extendPreset()` remains intentionally coupled to the source preset.
- Plugin configuration supplied through preset composition uses replacement semantics.
- A source plugin factory can be invoked explicitly when following its configuration is intentional.
- `createTestFramework({ preset })` configures a framework with one default runtime environment.
- `createTestFramework({ presets })` configures a framework with a registry of named runtime environments.
- `preset` and `presets` are mutually exclusive framework configuration forms.
- `extraOptions.preset` selects a named runtime environment for an individual factory invocation.
- `mountOptions.plugins` replaces managed plugin configuration at a more local scope.
- `extraOptions.plugins` provides a targeted shallow overlay.
- Mutable plugin runtime state must remain isolated between component factory invocations.

The resulting architecture separates reusable TestForge infrastructure from project-owned configuration:

```text
                         TestForge Core
                               │
                        runtime pipeline
                               │
              ┌────────────────┴────────────────┐
              │                                 │
           Plugins                           Presets
              │                                 │
     integration knowledge             runtime profiles
              │                                 │
              │                 ┌───────────────┴───────────────┐
              │                 │                               │
              │          TestForge-owned                 Project-owned
              │              presets                         presets
              │                 │                               │
              │        ┌────────┴────────┐                      │
              │        │                 │                      │
              │      Base          Recommended                 │
              │      preset          presets                    │
              │                        │                         │
              │                  Vitest / Jest                  │
              │                                                  │
              └─────────────── integration knowledge ────────────┘
                                                                 │
                                                     explicit configuration
                                                                 │
                                                       Host application
```

A project-owned preset can be created independently:

```text
Plugins
   │
   │ integration contract
   ▼
Project Preset
   │
   │ explicit materialized configuration
   ▼
Host Application
```

or intentionally composed from an existing reusable preset:

```text
Recommended Preset
        │
        │ optional extendPreset()
        ▼
Project Preset
        │
        │ inherits non-replaced source configuration
        ▼
Host Application
```

These are both supported models, but they have different ownership semantics.

The primary project-owned model favors **explicit configuration ownership**, while preset composition remains available when **intentional reuse and coupling to another preset** is desirable.
