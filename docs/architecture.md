# 🏗️ Architectural Overview: The Plugin & Preset Matrix

`@testforgejs/vue-test-core` implements a **strict microkernel architecture**. The core engine is completely blind: it has zero internal knowledge of Pinia, Vue Router, vue-i18n, Vuetify, or any other Vue ecosystem library. It contains no global plugin registry and no hardcoded plugin configurations.

Instead, the testing environment is assembled from **plugins**, **presets**, and a hierarchical **state layering pipeline**.

> [!NOTE]
>
> **TestForge architecture**
>
> - **Core** defines the runtime and configuration pipeline.
> - **Plugins** define integrations with Vue ecosystem libraries.
> - **Base presets** define reusable, runner-independent test environments.
> - **Runner-specific recommended presets** add behavior required by a particular test runner.
> - **The host application** provides the actual Vue ecosystem dependencies used by the application and its tests.
>
> This separation allows shared Vue testing infrastructure to be reused across different test runners without duplicating plugin integration or configuration logic.

---

## Presets as Runtime Environment Profiles

A Preset in TestForge is not just a collection of convenient defaults. It acts as:

- **A Runtime Environment Profile:** It defines which parts of the application's testing environment are available and active during a test run.
- **A Plugin Capability Boundary:** It defines the exact boundary of which managed plugins can be configured. If a plugin is not declared in the active preset manifest, configuration for that plugin is invalid and the framework rejects it during validation.
- **A Dependency Graph Declaration:** It maps TestForge plugin modules to their plugin names and activation state.

A preset defines two critical fields:

- `manifest` — declares **which managed plugins are registered and available in the runtime environment**;
- `defaults` — declares **how the baseline configuration for those plugins is created**.

The `defaults` field contains **plugin options factories**, rather than shared plugin configuration objects. TestForge invokes these factories when resolving a preset so that each pipeline context receives its own plugin configuration.

### Preset Structure Example

```typescript
const presets = {
  default: {
    manifest: [
      { module: piniaPlugin, enabled: true },
      { module: i18nPlugin, enabled: false },
    ],
    defaults: {
      pinia: () => ({
        stubActions: true,
      }),
      i18n: () => ({
        locale: "uk",
        messages: {},
      }),
    },
  },
  i18nOnly: {
    manifest: [{ module: i18nPlugin, enabled: true }],
    defaults: {
      i18n: () => ({
        locale: "en",
        messages: {},
      }),
    },
  },
};
```

The `manifest` establishes the managed plugin capability boundary, while `defaults` provides the baseline options for plugins available in that environment.

---

## `defaults` as Plugin Options Factories

Preset plugin defaults are defined as `PluginOptionsFactory` functions rather than shared configuration objects.

```typescript
defaults: {
  pinia: () => ({
    initialState: {},
    stubActions: false,
  }),
}
```

TestForge invokes the factory when resolving the preset configuration for a pipeline context. Each invocation therefore receives a fresh plugin options object.

This is important for plugins whose options may contain mutable or stateful nested values, such as:

- Pinia state;
- Vue Router routes and history configuration;
- Vue I18n messages and related configuration;
- other plugin-specific mutable options.

A preset should therefore not define plugin defaults as a shared object:

```typescript
defaults: {
  pinia: {
    initialState: {},
  },
}
```

Instead, define them as a factory:

```typescript
defaults: {
  pinia: () => ({
    initialState: {},
  }),
}
```

For example:

```typescript
const defaultI18n = () => ({
  locale: "en",
  messages: {},
});

const first = defaultI18n();
const second = defaultI18n();

first !== second; // true
```

Each call creates a separate options object.

This prevents mutable plugin configuration from being shared between independent pipeline contexts.

Plugin-specific option types can be applied directly to the returned configuration:

```typescript
pinia: () =>
  ({
    stubActions: true,
  }) satisfies VueTestPiniaOptions,
```

This keeps preset definitions strongly typed while preserving the factory-based configuration model.

### Factories and Preset Composition

Because plugin defaults are factories, the base factory must be invoked before its returned options can be extended.

For example:

```typescript
defaults: {
  pinia: () => ({
    ...basePreset.defaults.pinia(),
    createSpy: vi.fn,
  }),
}
```

The base factory creates a fresh configuration object, which can then be customized by the consuming preset.

The factory itself is still replaced by the extension. The base configuration is preserved only because the extension explicitly invokes the base factory and spreads its returned options.

This makes inheritance explicit rather than implicit.

---

## Preset Composition

Presets can be composed using `extendPreset()`.

`extendPreset()` creates a new preset from an existing preset while allowing the consuming project to explicitly customize the plugin manifest and plugin default factories.

This provides a controlled way to build project-specific runtime environments without duplicating an entire preset definition.

```typescript
import { extendPreset } from "@testforgejs/vue-test-core";
import { presets as recommendedPresets } from "@testforgejs/vue-test-preset-recommended";
import { vi } from "vitest";

const presets = {
  default: extendPreset(recommendedPresets.default, {
    defaults: {
      pinia: () => ({
        ...recommendedPresets.default.defaults.pinia(),
        createSpy: vi.fn,
      }),
    },
  }),
};
```

The resulting preset is a new runtime environment profile.

It inherits the base preset's manifest and default factories unless they are explicitly overridden by the extension.

`extendPreset()` operates at **preset-definition time**. It does not create inheritance between runtime configuration layers used by individual factory invocations.

---

## Explicit Plugin Configuration Replacement

When an extension provides configuration for an existing plugin, that plugin's default configuration is **replaced as a whole**.

TestForge does not deep-merge plugin configuration between the base preset and the extension.

For example, if the base preset contains:

```typescript
defaults: {
  pinia: () => ({
    initialState: {
      user: { id: 1 },
    },
    stubActions: true,
  }),
}
```

and the extension provides:

```typescript
defaults: {
  pinia: () => ({
    createSpy: vi.fn,
  }),
}
```

the resulting preset uses the explicitly supplied Pinia defaults:

```typescript
defaults: {
  pinia: () => ({
    createSpy: vi.fn,
  }),
}
```

The `initialState` and `stubActions` values from the base preset are not implicitly inherited into the overridden `pinia` configuration.

This replacement semantics is intentional. Once a project explicitly configures a plugin, the resulting preset configuration must be predictable and must not silently acquire additional options from the base preset.

If selected base options should be preserved, they must be copied explicitly by invoking the base factory:

```typescript
defaults: {
  pinia: () => ({
    ...recommendedPresets.default.defaults.pinia(),
    createSpy: vi.fn,
  }),
}
```

This creates a fresh base configuration before applying the project-specific changes.

---

## Extending the Plugin Manifest

An extension can also add managed plugins to the base preset.

```typescript
const extendedPreset = extendPreset(basePreset, {
  manifest: [
    {
      module: customPlugin,
      enabled: true,
    },
  ],

  defaults: {
    customPlugin: () => ({
      // plugin-specific defaults
    }),
  },
});
```

A newly added plugin must explicitly define its `enabled` state and provide its default options factory.

An extension may also change the `enabled` state of a plugin already declared in the base manifest.

Preset extensions are validated before the resulting preset is created. Invalid extensions, such as duplicate manifest entries or defaults for undeclared plugins, are rejected during preset construction.

> [!IMPORTANT]
>
> `extendPreset()` is a **preset composition mechanism**, not a runtime configuration overlay.
>
> The resulting preset remains a complete runtime environment definition with its own manifest and plugin default factories.
>
> Runtime test-specific changes should instead use `mountOptions.plugins` or `extraOptions.plugins`.

---

## ⚠️ Preset Runtime Boundaries

Presets define the complete managed plugin environment for a factory invocation.

If a plugin is not declared in the active preset manifest, configuring it is considered invalid.

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

If `i18nPreset` declares only `i18n`, the framework rejects the Pinia configuration.

This guarantees that an active preset behaves as an isolated runtime environment rather than as a partial configuration overlay.

The distinction between preset composition and runtime configuration is important:

- `extendPreset()` constructs a new preset definition before the runtime environment is resolved;
- `extraOptions.preset` selects one complete preset for a factory invocation;
- `mountOptions.plugins` and `extraOptions.plugins` modify managed plugin configuration within the selected runtime environment.

They are therefore separate stages of configuration resolution.

**Important:** If `mountOptions.plugins` or `extraOptions.plugins` contains configuration for a plugin that is **not declared** in the active preset's manifest, the framework throws a validation error.

---

## Presets and the Runtime Configuration Pipeline

Preset defaults provide only the initial configuration for the selected runtime environment.

Once a preset has been selected, TestForge resolves more local configuration through the factory invocation.

Conceptually:

```text
Preset definition
      │
      │  selects manifest + default factories
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
- `defaultMountOptions.plugins` replaces the corresponding managed plugin configuration;
- `mountOptions.plugins` replaces the corresponding managed plugin configuration again at test level;
- `extraOptions.plugins` provides a shallow overlay on the already resolved managed plugin configuration.

This distinction allows TestForge to combine reusable preset definitions with explicit, test-specific configuration without turning every configuration layer into implicit deep inheritance.

---

## Base Presets, Recommended Presets, and Applications

TestForge separates reusable testing infrastructure into several levels.

### Base Presets

A base preset provides runner-independent plugin integration and configuration.

For example:

```text
@testforgejs/vue-test-preset-base
```

can provide common environments for:

- Pinia;
- Vue Router;
- Vue I18n;
- Vuetify;
- other supported Vue integrations.

The base preset should avoid dependencies on a particular test runner whenever possible.

### Runner-Specific Recommended Presets

Runner-specific recommended presets extend the base environment with behavior required by a particular test runner.

For example:

```text
@testforgejs/vue-test-preset-recommended
@testforgejs/vue-test-preset-recommended-jest
```

The Vitest preset may provide Vitest-specific spies:

```typescript
pinia: () => ({
  ...basePresets.default.defaults.pinia(),
  createSpy: vi.fn,
});
```

while the Jest preset can provide the corresponding Jest implementation.

This keeps runner-specific behavior out of the runner-independent base preset.

### Host Application

The application remains responsible for its own Vue ecosystem dependencies and application-specific configuration.

For example, an application may extend a recommended preset with its own:

- Vue Router routes;
- Vue I18n locale and messages;
- Pinia defaults;
- Vuetify configuration;
- application-specific plugin options.

This keeps reusable TestForge infrastructure independent from any one application's route structure, state model, or localization data.

---

## Project-Specific Presets

A project that needs application-specific defaults should normally extend an existing preset rather than duplicate it.

For example:

```typescript
import { extendPreset } from "@testforgejs/vue-test-core";
import { presets as basePresets } from "@testforgejs/vue-test-preset-base";

export const projectPresets = {
  default: extendPreset(basePresets.default, {
    defaults: {
      i18n: () => ({
        ...basePresets.default.defaults.i18n(),
        locale: "uk",
        fallbackLocale: "uk",
        messages: {
          uk: {
            welcome: "Вітаємо",
          },
        },
      }),

      pinia: () => ({
        ...basePresets.default.defaults.pinia(),
        initialState: {},
      }),
    },
  }),
};
```

Application-specific Router configuration can be defined in the same way:

```typescript
export const projectPresets = {
  default: extendPreset(basePresets.default, {
    defaults: {
      router: () => ({
        ...basePresets.default.defaults.router(),
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
  }),
};
```

The application can then use its project-specific preset registry:

```typescript
import { createTestFramework } from "@testforgejs/vue-test-core";
import { projectPresets } from "./presets.js";

const { testComponentFactory } = createTestFramework({
  presets: projectPresets,
});
```

Project-specific presets are the appropriate place for configuration that reflects the application's own runtime structure.

For example, application routes should generally not be added to the runner-independent base preset because each host application has its own route structure.

A project can instead define simple route stubs for component tests:

```typescript
const HomeStub = {
  name: "HomeStub",
  template: '<div data-testid="home-stub"></div>',
};

const UsersStub = {
  name: "UsersStub",
  template: '<div data-testid="users-stub"></div>',
};
```

and include them in the application's project-specific Router defaults.

This keeps the shared base preset minimal while allowing component tests to run against the route structure required by the application.

For tests that require a different Router configuration for an individual scenario, use the managed Router configuration at factory or test level instead of changing the project-wide preset.

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

### 4. Prefer Composition over Duplication

If an existing preset is close to what a project needs, use `extendPreset()` rather than copying the entire preset definition.

This keeps project-specific changes explicit and reduces the risk of copied presets diverging from their source.

### 5. Keep Replacement Semantics Explicit

When `extendPreset()` replaces a plugin's defaults, it should replace that plugin configuration as a whole.

If base options should be retained, invoke the base factory explicitly and extend its returned object.

This prevents accidental configuration inheritance.

### 6. Separate Preset Composition from Runtime Configuration

`extendPreset()` is used to construct preset definitions.

Runtime options such as `mountOptions.plugins` and `extraOptions.plugins` are used to configure individual factory invocations.

These mechanisms should not be treated as interchangeable forms of inheritance.

### 7. Keep Base Defaults Minimal

Base presets should establish reusable testing infrastructure rather than encode application-specific test scenarios.

Application-specific routes, messages, state, and other domain configuration belong in project-specific presets or local test configuration.

### 8. Keep Runtime Environments Isolated

A preset should not cause mutable plugin runtime instances to be shared between independent factory invocations.

Plugin integrations should create independent runtime state for each mount.

This is particularly important for stateful integrations such as:

- Pinia;
- Vue Router history;
- Vue I18n runtime state.

### 9. Keep Runner-Specific Behavior in Runner-Specific Presets

Runner-independent infrastructure belongs in the base preset.

Vitest- or Jest-specific behavior belongs in the corresponding recommended preset or in the consuming project.

### 10. Keep Application Dependencies in the Host Application

TestForge plugins define how an ecosystem library integrates with the testing runtime, but the host application supplies the actual application dependencies and application-specific configuration.

This keeps TestForge's reusable infrastructure independent from any single application's architecture.

---

## Summary

TestForge uses a strict microkernel architecture in which the core runtime is independent of the Vue ecosystem libraries it orchestrates.

The key principles are:

- **Core** defines the runtime and configuration pipeline.
- **Plugins** define integrations with Vue ecosystem libraries.
- **Presets** define complete runtime environment profiles.
- `manifest` defines the managed plugin capability boundary.
- `defaults` contains `PluginOptionsFactory` functions rather than shared plugin option objects.
- Each plugin options factory invocation produces a fresh configuration object.
- `extendPreset()` composes reusable preset definitions before runtime configuration begins.
- Plugin configuration supplied through preset composition uses replacement semantics.
- Base configuration can be preserved explicitly by invoking the base plugin options factory.
- `extraOptions.preset` selects a complete preset for a factory invocation.
- `mountOptions.plugins` replaces managed plugin configuration at a more local scope.
- `extraOptions.plugins` provides a targeted shallow overlay.
- Base presets should remain runner-independent and application-agnostic.
- Runner-specific recommended presets provide test-runner-specific behavior.
- Project-specific presets provide application-specific routes, state, localization, and other runtime configuration.
- Mutable plugin runtime state must remain isolated between component factory invocations.

The resulting architecture separates concerns cleanly:

```text
                     TestForge Core
                           │
                    runtime pipeline
                           │
             ┌─────────────┴─────────────┐
             │                           │
          Plugins                     Presets
             │                           │
     Vue ecosystem APIs       runtime environment profiles
                                         │
                           ┌─────────────┴─────────────┐
                           │                           │
                      Base presets             Recommended presets
                                                    │
                                             Vitest / Jest
                                                    │
                                                    ▼
                                           Host application
                                                    │
                                      project-specific presets
```

This separation allows TestForge to provide reusable Vue testing infrastructure while keeping application-specific configuration and test-runner behavior outside the core engine.
