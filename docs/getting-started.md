# 🚀 Getting Started with TestForge

This guide walks you through the basic TestForge workflow: installing TestForge, configuring a preset, creating reusable component factories, and using managed Vue ecosystem plugins in your tests.

By the end of this guide, you will have a shared `testComponentFactory` that can be reused across your component tests and configured with project-wide plugin defaults and test-specific options.

## 1. 📦 Installation

This guide uses Vitest together with the official recommended preset.

Install the TestForge core, the recommended preset, and Vue Test Utils:

```bash
pnpm add -D \
  @testforgejs/vue-test-core \
  @testforgejs/vue-test-preset-recommended \
  @vue/test-utils
```

You can also use `npm` or `yarn` if they are used by your project.

The core package provides the TestForge runtime and component factory system. The recommended preset provides ready-to-use configuration for commonly used Vue ecosystem plugins and adds Vitest-specific defaults where required.

> [!NOTE]
> TestForge requires [Vue](https://vuejs.org/) 3.3.0 or higher and [Vue Test Utils](https://test-utils.vuejs.org/) 2.0.0 or higher.
>
> Both `vue` and `@vue/test-utils` are peer dependencies and must be available in your project. Vue is usually already installed as part of a Vue application, while Vue Test Utils should be added to your development dependencies.

> [!NOTE]
> This guide assumes that your project already uses Vitest and has a DOM-like test environment configured, such as `happy-dom` or `jsdom`.
>
> TestForge mounts Vue components through Vue Test Utils, so component tests require a browser-like environment.

For example, a minimal Vitest configuration might look like this:

```typescript
// vitest.config.ts

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "happy-dom",
  },
});
```

> [!NOTE]
> This guide uses Vitest and `@testforgejs/vue-test-preset-recommended`.
>
> If your project uses Jest, use `@testforgejs/vue-test-preset-recommended-jest` instead. See the [Jest preset documentation](https://github.com/testforgejs/testforge/blob/main/packages/vue-test-preset-recommended-jest/README.md) for details.

---

## 2. 🧩 Understanding Presets

Before creating your TestForge framework, it is useful to understand the role of a **preset**.

A preset defines:

- which managed plugins are available in the test environment;
- which plugins are enabled by default;
- the baseline configuration factories for those plugins.

The TestForge core does not automatically know about Vue ecosystem plugins.

A managed plugin becomes available to the framework only when it is declared in the active preset's `manifest`.

Conceptually:

```text
preset.manifest
→ defines available managed plugins

preset.defaults
→ defines their baseline configuration
```

For example, the official recommended preset provides a runtime environment containing managed integrations such as Pinia, Vue I18n, and Vue Router:

```typescript
import { presets } from "@testforgejs/vue-test-preset-recommended";
```

Official TestForge presets can also be composed from other reusable presets.

For example, `@testforgejs/vue-test-preset-recommended` builds on `@testforgejs/vue-test-preset-base`. The base package provides runner-independent composition, while the recommended package adds Vitest-specific configuration where required.

You do not need to understand this composition to get started.

For most projects, begin with:

```typescript
preset: presets.default;
```

If you later want your project to own its testing configuration directly, you can create a project-specific preset with explicit plugin factories.

> [!TIP]
> Start with the recommended preset if you are new to TestForge.
>
> Create a project-owned preset when you want the effective plugin configuration to be visible and editable directly in your project.

See the [Preset Authoring Guide](./preset-authoring-guide.md) for information about creating and composing presets.

---

## 3. 🧩 Integrating TestForge into a Project

It is recommended to create a single TestForge configuration file, usually `tests/setup.ts` or `tests/test-utils.ts`.

### Using a Ready-Made Preset

The simplest approach is to use the default environment from the official recommended preset:

```typescript
// @/tests/setup.ts

import { createTestFramework } from "@testforgejs/vue-test-core";
import { presets } from "@testforgejs/vue-test-preset-recommended";

const { testComponentFactory } = createTestFramework({
  preset: presets.default,
});

export { testComponentFactory };
```

This creates one shared TestForge runtime environment for your test suite.

A single `preset` is the preferred form when your project needs only one testing environment.

### Using a Custom Project Preset

You can also create your own preset when you want to control exactly which managed plugins are available and how they are configured.

A project-owned preset should normally make its concrete plugin configuration explicit.

Plugin integrations imported directly by a project-owned preset must be installed as direct project dependencies.

For example, a minimal Pinia environment for Vitest requires the Pinia integration package:

```bash
pnpm add -D @testforgejs/vue-test-plugin-pinia
```

It can then be configured explicitly in the project preset:

```typescript
// @/tests/setup.ts

import { vi } from "vitest";
import { createTestFramework, type PresetDefinition } from "@testforgejs/vue-test-core";
import { piniaPlugin, PLUGIN_NAME as PINIA_PLUGIN_NAME } from "@testforgejs/vue-test-plugin-pinia";

const preset = {
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
  preset,
});

export { testComponentFactory };
```

The preset is a normal TypeScript object owned by your project.

Its effective Pinia configuration is visible directly in source:

```typescript
{
  createSpy: vi.fn,
}
```

This means the project does not depend on hidden preset defaults for the configuration it owns.

Project-owned configuration should remain minimal. You do not need to list every option supported by Pinia, Vue Router, Vue I18n, or another integrated library unless your project intentionally wants to control that option.

### Using Multiple Named Presets

If your project needs multiple runtime environments, use the `presets` option instead:

```typescript
const { testComponentFactory } = createTestFramework({
  presets: {
    default: appPreset,
    integration: integrationPreset,
  },
});
```

The two framework configuration forms are mutually exclusive:

```text
preset
→ one runtime environment

presets
→ multiple named runtime environments
→ runtime selection through extraOptions.preset
```

A single `preset` is internally treated as the framework's default environment.

A `presets` registry exposes several named runtime profiles that can be selected when invoking a component factory.

You can then import the configured factory into your tests:

```typescript
import { describe, expect, it } from "vitest";

import { testComponentFactory } from "@/tests/setup";
import MyComponent from "@/components/MyComponent.vue";

const factory = testComponentFactory(MyComponent);

describe("MyComponent.vue", () => {
  it("renders correctly", () => {
    const wrapper = factory();

    expect(wrapper.exists()).toBe(true);
  });
});
```

### `createTestFramework` Parameters

| Parameter          | Type                   | Default | Description                                                          |
| :----------------- | :--------------------- | :------ | :------------------------------------------------------------------- |
| `preset`           | `PresetDefinition`     | —       | A single preset used as the framework's default runtime environment. |
| `presets`          | `TestFrameworkPresets` | `{}`    | A registry of named runtime environments available to the framework. |
| `shallowByDefault` | `boolean`              | `false` | Use `shallowMount()` instead of `mount()` by default.                |

> [!NOTE]
> `preset` and `presets` cannot be used together.
>
> For a single project-wide environment, `preset` is usually the simplest option. Use `presets` when you intentionally need multiple named runtime profiles.

---

## 4. 🏭 Creating a Reusable Component Factory

`testComponentFactory` creates a reusable factory for mounting a specific component.

You can create a factory once and reuse it across multiple tests.

The factory can define common component props, slots, Vue Test Utils options, and managed plugin configuration that should be shared by the tests using that factory.

```typescript
const factory = testComponentFactory(MyComponent, {
  title: "Default title",
});
```

Individual tests can then provide their own values:

```typescript
it("renders the custom title", () => {
  const wrapper = factory({
    title: "Custom title",
  });

  expect(wrapper.text()).toContain("Custom title");
});
```

This keeps repetitive mounting configuration in one place while allowing individual tests to customize the component when necessary.

---

## 5. 🛠 Using Managed Plugins

TestForge provides managed integrations for Vue ecosystem libraries such as Pinia, Vue Router, Vue I18n, Vuetify, and PrimeVue.

Managed plugins can be configured through presets and through TestForge's managed `plugins` API.

Unlike manually registered Vue Test Utils plugins, managed plugins are known to TestForge through plugin modules declared in the active preset.

### Managed Plugin Identifiers

Every TestForge managed plugin has a stable identifier.

Each plugin package exposes that identifier through the standardized `PLUGIN_NAME` export.

For example:

```text
@testforgejs/vue-test-plugin-pinia
→ PLUGIN_NAME === "pinia"
```

Project-owned presets can use this exported constant when declaring preset defaults, as shown earlier in [Using a Custom Project Preset](#using-a-custom-project-preset).

At runtime, the normal consumer-facing API uses the corresponding string key:

```typescript
plugins: {
  pinia: {
    // ...
  },
}
```

The official managed plugin identifiers are:

| Integration | Package                                    | `PLUGIN_NAME` value | Runtime `plugins` key |
| :---------- | :----------------------------------------- | :------------------ | :-------------------- |
| Pinia       | `@testforgejs/vue-test-plugin-pinia`       | `"pinia"`           | `pinia`               |
| Vue Router  | `@testforgejs/vue-test-plugin-router`      | `"router"`          | `router`              |
| Vue I18n    | `@testforgejs/vue-test-plugin-i18n`        | `"i18n"`            | `i18n`                |
| Vuetify     | `@testforgejs/vue-test-plugin-vuetify`     | `"vuetify"`         | `vuetify`             |
| PrimeVue    | `@testforgejs/vue-test-plugin-primevue`    | `"primevue"`        | `primevue`            |
| PrimeVue 3  | `@testforgejs/vue-test-plugin-primevue-v3` | `"primevueV3"`      | `primevueV3`          |

These identifiers are part of the TestForge plugin contract.

They are not arbitrary names chosen by individual tests.

### The Active Preset Defines Available Plugins

The `plugins` object is **not** a general-purpose Vue plugin registry.

Its keys must identify TestForge managed plugins declared in the active preset's `manifest`.

Conceptually:

```text
active preset
     │
     ▼
manifest
     │
     ▼
available managed plugin identifiers
     │
     ▼
plugins: {
  pinia: ...,
  router: ...,
}
```

If the active preset declares:

```text
pinia
i18n
router
```

then those are the managed plugin identifiers that can be configured through the TestForge `plugins` API.

A plugin package merely being installed in the project does not make that plugin available to TestForge.

It must belong to the active preset.

### Configuring a Managed Plugin

For example, Pinia can be configured when creating a component factory:

```typescript
const factory = testComponentFactory(
  MyComponent,
  {},
  {
    plugins: {
      pinia: {
        initialState: {
          user: {
            id: 1,
          },
        },
      },
    },
  },
);
```

Here:

```text
pinia
→ managed plugin identifier

initialState
→ Pinia-specific configuration
```

The configuration is specific to the factory and is applied when the factory mounts the component.

You can also provide plugin configuration for an individual test:

```typescript
factory(
  {},
  {
    plugins: {
      pinia: {
        initialState: {
          user: {
            id: 2,
          },
        },
      },
    },
  },
);
```

The exact options available depend on the managed plugin.

For example, Router configuration uses the `router` identifier:

```typescript
plugins: {
  router: {
    // Router-specific options
  },
}
```

PrimeVue 3 uses:

```typescript
plugins: {
  primevueV3: {
    // PrimeVue 3-specific options
  },
}
```

The identifier determines which managed plugin receives the configuration, while that plugin's type definitions determine which options are valid.

See the documentation for the individual plugin packages for plugin-specific configuration:

- [`@testforgejs/vue-test-plugin-pinia`](../packages/vue-test-plugin-pinia/docs/api/README.md)
- [`@testforgejs/vue-test-plugin-router`](../packages/vue-test-plugin-router/docs/api/README.md)
- [`@testforgejs/vue-test-plugin-i18n`](../packages/vue-test-plugin-i18n/docs/api/README.md)
- [`@testforgejs/vue-test-plugin-vuetify`](../packages/vue-test-plugin-vuetify/docs/api/README.md)
- [`@testforgejs/vue-test-plugin-primevue`](../packages/vue-test-plugin-primevue/docs/api/README.md)
- [`@testforgejs/vue-test-plugin-primevue-v3`](../packages/vue-test-plugin-primevue-v3/docs/api/README.md)

---

## 6. 🔌 Enabling and Disabling Managed Plugins

A managed plugin must belong to the active preset before it can be configured through the managed plugin API.

The preset's `manifest` determines both:

- whether the plugin is available;
- whether it is enabled by default.

Conceptually:

```text
plugin absent from manifest
→ unavailable
→ cannot be configured through plugins

plugin in manifest + enabled: false
→ available
→ disabled by default

plugin in manifest + enabled: true
→ available
→ enabled by default
```

### Enabling a Plugin

If a plugin is registered in the active preset but disabled by default, you can provide configuration for it when creating a factory or mounting a component.

For example, if Router belongs to the active preset but is disabled by default:

```typescript
const factory = testComponentFactory(
  MyComponent,
  {},
  {
    plugins: {
      router: {},
    },
  },
);
```

The `router` key is valid because the Router plugin belongs to the active preset's manifest.

### Disabling a Plugin

You can also explicitly disable a managed plugin for a specific factory or test:

```typescript
factory(
  {},
  {
    plugins: {
      router: false,
    },
  },
);
```

This is useful when a plugin is normally active in the selected runtime environment but is not required for a particular test.

### Invalid Plugin Configuration

If a plugin is not declared in the active preset, configuring it is invalid.

For example, suppose the active preset contains only Vue I18n.

This configuration is invalid:

```typescript
factory(
  {},
  {
    plugins: {
      pinia: {},
    },
  },
);
```

even if `@testforgejs/vue-test-plugin-pinia` is installed in the project.

The Pinia managed plugin must first belong to the active preset's manifest.

> [!NOTE]
> Managed plugin configuration is validated against the active preset.
>
> Keys used inside `plugins` must correspond to managed plugin identifiers declared by that preset.

When a framework uses multiple named presets, the capability boundary belongs to the preset selected for the current factory invocation.

For example:

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

selects the named `router` runtime profile, and its manifest determines which managed plugin identifiers are valid for that invocation.

---

## 7. 📚 Where to Go Next

Now that you have a basic TestForge setup, you can explore the more advanced parts of the framework:

- **[Configuration & Advanced Usage](./configuration.md)** — Learn how TestForge resolves configuration across presets, factories, tests, and extra options.
- **[Preset Authoring Guide](./preset-authoring-guide.md)** — Create project-specific, organization-wide, or reusable presets.
- **[Plugin Authoring Guide](./plugin-authoring-guide.md)** — Build custom managed plugins for TestForge.
