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

Most applications should start with an existing preset and extend it rather than creating a complete preset registry from scratch.

---

## 1. Preset Structure

A preset consists of two primary parts:

1. `manifest` — declares the managed plugins available in the runtime environment.
2. `defaults` — defines the baseline configuration for those plugins.

```typescript
import type { TestFrameworkPresets } from "@testforgejs/vue-test-core";
import { piniaPlugin, type VueTestPiniaOptions } from "@testforgejs/vue-test-plugin-pinia";
import { i18nPlugin, type VueTestI18nOptions } from "@testforgejs/vue-test-plugin-i18n";
import { routerPlugin } from "@testforgejs/vue-test-plugin-router";

export const presets = {
  default: {
    manifest: [
      { module: piniaPlugin, enabled: true },
      { module: i18nPlugin, enabled: true },
      { module: routerPlugin, enabled: false },
    ],

    defaults: {
      pinia: {
        initialState: {},
        stubActions: false,
      } satisfies VueTestPiniaOptions,

      i18n: {
        legacy: false,
        locale: "en",
        fallbackLocale: "en",
        messages: {},
        fallbackWarn: false,
        missingWarn: false,
      } satisfies VueTestI18nOptions,
    },
  },
} satisfies TestFrameworkPresets;
```

The `satisfies` operator is recommended because it validates the preset structure and provides plugin-specific type checking without changing the inferred type of the preset object.

---

## 2. The `manifest`

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

## 3. The `defaults`

The `defaults` object defines the baseline configuration for managed plugins.

For example:

```typescript
defaults: {
  pinia: {
    initialState: {},
    stubActions: false,
  },

  i18n: {
    legacy: false,
    locale: "en",
    fallbackLocale: "en",
    messages: {},
  },
},
```

Plugin configuration should be kept small and predictable.

Application-specific test data should generally not be placed into global preset defaults. Scenario-specific state belongs in factory or test-level configuration.

Plugin-specific option types should be used when authoring presets:

```typescript
pinia: {
  initialState: {},
  stubActions: false,
} satisfies VueTestPiniaOptions,
```

This catches invalid plugin options while keeping the preset easy to read.

---

## 4. The `default` Preset

Every preset registry should normally provide a `default` profile.

The `default` preset is used when no other preset is selected for a factory invocation.

```typescript
const { testComponentFactory } = createTestFramework({
  presets,
});
```

A project-level `default` preset should represent the runtime environment required by the majority of the project's component tests.

Specialized environments should be represented by additional named presets.

For example:

```typescript
export const presets = {
  default: {
    // normal component-test environment
  },

  piniaPreset: {
    // Pinia-only environment
  },

  i18nPreset: {
    // I18n-only environment
  },

  routerPreset: {
    // Router-only environment
  },
};
```

---

## 5. Specialized Presets

A preset registry can contain multiple independent runtime profiles.

For example, `@testforgejs/vue-test-preset-base` provides:

- `default`
- `piniaPreset`
- `i18nPreset`
- `routerPreset`

The specialized presets intentionally contain only the plugin required by that environment.

For example:

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

This is different from disabling Pinia and Router in the default preset.

An `i18nPreset` does not merely disable unrelated plugins. They are outside the runtime capability boundary altogether.

---

## 6. Preset Composition with `extendPreset()`

When an existing preset is almost suitable for a project, use `extendPreset()` instead of copying the entire preset.

```typescript
import { extendPreset } from "@testforgejs/vue-test-core";

import { presets as basePresets } from "@testforgejs/vue-test-preset-base";

export const presets = {
  default: extendPreset(basePresets.default, {
    defaults: {
      i18n: {
        ...basePresets.default.defaults.i18n,
        locale: "uk",
      },
    },
  }),
} satisfies TestFrameworkPresets;
```

The resulting preset is a new, independent preset definition.

`extendPreset()` is a **preset composition mechanism**. It is not a runtime configuration overlay.

### 6.1. Extending Plugin Defaults

When an extension provides configuration for an existing plugin, that plugin's configuration is replaced as a whole.

For example, suppose the base preset contains:

```typescript
defaults: {
  pinia: {
    initialState: {},
    stubActions: false,
  },
},
```

This extension:

```typescript
extendPreset(basePreset, {
  defaults: {
    pinia: {
      createSpy: vi.fn,
    },
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
    pinia: {
      ...basePreset.defaults.pinia,
      createSpy: vi.fn,
    },
  },
});
```

This replacement semantics makes preset composition predictable and prevents configuration from being inherited implicitly.

---

## 7. Runner-Specific Presets

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
      pinia: {
        ...basePresets.default.defaults.pinia,
        createSpy: vi.fn,
      },
    },
  }),

  piniaPreset: extendPreset(basePresets.piniaPreset, {
    defaults: {
      pinia: {
        ...basePresets.piniaPreset.defaults.pinia,
        createSpy: vi.fn,
      },
    },
  }),

  i18nPreset: basePresets.i18nPreset,
  routerPreset: basePresets.routerPreset,
};
```

The Jest recommended preset follows the same principle but supplies Jest-specific behavior.

This separation keeps the base preset reusable while allowing each runner-specific preset to provide the integration required by its test runner.

---

## 8. Selecting a Preset at Runtime

A factory can select a specific preset using the fourth argument, `extraOptions`.

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

The `preset` property has the following meaning:

```typescript
type PresetName = keyof TestFrameworkPresets;
```

It selects a complete preset profile for the current factory invocation.

For example:

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

This is intentional: each preset represents a complete runtime environment.

---

## 9. Preset Configuration Layers

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

## 10. Creating a Project-Specific Preset

For a project that needs custom defaults, start from an existing preset whenever possible.

For example:

```typescript
import { extendPreset } from "@testforgejs/vue-test-core";
import { presets as basePresets } from "@testforgejs/vue-test-preset-base";

export const projectPresets = {
  default: extendPreset(basePresets.default, {
    defaults: {
      i18n: {
        ...basePresets.default.defaults.i18n,
        locale: "uk",
        fallbackLocale: "uk",
        messages: {
          uk: {
            welcome: "Вітаємо",
          },
        },
      },

      pinia: {
        ...basePresets.default.defaults.pinia,
        initialState: {},
      },
    },
  }),
};
```

Then pass the project registry to the framework:

```typescript
import { createTestFramework } from "@testforgejs/vue-test-core";
import { projectPresets } from "./presets.js";

const { testComponentFactory } = createTestFramework({
  presets: projectPresets,
});
```

This approach keeps the project-specific changes explicit while inheriting the base preset's manifest and unrelated defaults.

---

## 11. Preset Design Guidelines

### 11.1. Keep the base preset runner-independent

Do not put Vitest- or Jest-specific configuration into a runner-independent base preset.

Use a runner-specific preset when a plugin requires test-runner-specific functionality.

### 11.2. Prefer composition over duplication

If an existing preset is close to what the project needs, use `extendPreset()`.

Avoid copying an entire preset definition because copied presets can silently diverge from their source over time.

### 11.3. Remember replacement semantics

When extending an existing plugin configuration, providing a new configuration replaces that plugin's configuration.

Preserve selected base options explicitly:

```typescript
pinia: {
  ...basePresets.default.defaults.pinia,
  createSpy: vi.fn,
},
```

### 11.4. Keep defaults minimal

Preset defaults should establish the environment, not encode every test scenario.

Avoid large, mutable application-specific state structures in global defaults.

Use factory-level or test-level configuration for scenario-specific state.

### 11.5. Keep runtime environments isolated

A preset should not cause mutable runtime instances to be shared between separate factory invocations.

Plugin integrations should create independent runtime state for each mount.

This is particularly important for stateful integrations such as:

- Pinia;
- Vue Router history;
- Vue I18n messages and related runtime state.

### 11.6. Use specialized presets for specialized environments

If a group of tests needs only one managed plugin, consider creating a specialized preset rather than enabling unrelated plugins.

For example:

```typescript
i18nPreset;
```

can define an environment containing only Vue I18n.

This makes the runtime boundary explicit and prevents unrelated plugins from being initialized.

### 11.7. Treat the manifest as a capability boundary

Do not assume that a plugin can be configured simply because its TestForge integration is installed.

The plugin must be declared in the active preset manifest.

Configuration for undeclared plugins should be treated as invalid.

---

## 12. Recommended Package Strategy

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

## 13. Summary

A TestForge preset defines a complete runtime environment for managed plugins.

The key principles are:

- `manifest` defines the plugin capability boundary;
- `defaults` defines the baseline plugin configuration;
- `default` should represent the normal project environment;
- specialized presets provide isolated runtime profiles;
- `extendPreset()` composes reusable preset definitions;
- plugin configuration supplied to `extendPreset()` replaces that plugin's configuration as a whole;
- `extraOptions.preset` selects a complete preset for a factory invocation;
- `mountOptions.plugins` replaces managed plugin configuration at a more local scope;
- `extraOptions.plugins` provides a targeted shallow overlay;
- runner-specific behavior belongs in runner-specific presets;
- mutable plugin runtime state must remain isolated between factory invocations.

For most projects, the recommended workflow is:

1. Start with `@testforgejs/vue-test-preset-base` or a runner-specific recommended preset.
2. Select the appropriate runtime profile.
3. Use `extendPreset()` for project-specific defaults.
4. Keep test-specific state in factory or test configuration.
5. Add specialized presets when a distinct runtime environment is useful.
