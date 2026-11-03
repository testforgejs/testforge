# 🚀 Getting Started with TestForge

This guide walks you through the basic TestForge workflow: installing TestForge, configuring a preset, creating reusable component factories, mounting components with positional or object-based APIs, and using managed Vue ecosystem plugins in your tests.

By the end of this guide, you will have a shared `testComponentFactory`, know both ways to create and invoke component factories, and be able to configure project-wide plugin defaults and test-specific options.

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
preset: presets.default,
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
→ selection at factory creation or for an individual mount
```

A single `preset` is internally treated as the framework's default environment.

A `presets` registry exposes several named runtime profiles. Select one when creating a component factory, or override it temporarily for an individual mount.

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

This first test uses the **positional API**. TestForge also supports an equivalent **object-based API** at both stages:

```typescript
const factory = testComponentFactory.withOptions({ component: MyComponent });
const wrapper = factory.withOptions({});
```

Choose whichever form reads best for a particular test. Both creation styles return the same kind of factory, and both mounting styles use the same configuration pipeline. The next section shows how to pass props and other options using either form.

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

`testComponentFactory` creates a reusable factory for mounting a specific component. You can provide shared default props, slots, Vue Test Utils options, and managed plugin configuration, then override them for individual tests.

Both stages have two equivalent APIs:

| Stage             | Positional API                                      | Object-based API                                                    |
| :---------------- | :-------------------------------------------------- | :------------------------------------------------------------------ |
| Create a factory  | `testComponentFactory(Component, ...)`              | `testComponentFactory.withOptions({ component: Component, ... })`   |
| Mount a component | `factory(props, mountOptions, slots, extraOptions)` | `factory.withOptions({ props, mountOptions, slots, extraOptions })` |

### Creating a Factory: Two Equivalent Forms

For a small set of defaults, the positional API is concise:

```typescript
const factory = testComponentFactory(MyComponent, {
  title: "Default title",
});
```

The **object-based creation API** expresses the same configuration with named properties:

```typescript
const factory = testComponentFactory.withOptions({
  component: MyComponent,
  defaultProps: { title: "Default title" },
});
```

Both snippets are alternatives: choose one to create `factory`. The object-based form also accepts `defaultMountOptions`, `defaultSlots`, and an optional factory-level `presetKey`.

### Mounting a Component: Two Equivalent Forms

The returned factory supports both invocation styles regardless of how it was created. To override a prop for one test, call it positionally:

```typescript
it("renders the custom title", () => {
  const wrapper = factory({ title: "Custom title" });
  expect(wrapper.text()).toContain("Custom title");
});
```

Or pass a named configuration to **`factory.withOptions()`**:

```typescript
it("renders the custom title", () => {
  const wrapper = factory.withOptions({
    props: { title: "Custom title" },
  });
  expect(wrapper.text()).toContain("Custom title");
});
```

The two snippets describe the same test scenario. Default props are preserved unless overridden, and each mount is resolved independently.

For more than one kind of mount configuration, named properties avoid empty positional placeholders:

```typescript
const wrapper = factory.withOptions({
  props: { title: "Custom title" },
  mountOptions: { shallow: true },
  slots: { default: () => "Test content" },
  extraOptions: { skipDefaultProps: true },
});
```

These properties correspond **one-to-one** to the four arguments of `factory(props, mountOptions, slots, extraOptions)`:

- `props` — component props for this mount.
- `mountOptions` — Vue Test Utils options, including TestForge-managed `plugins`.
- `slots` — component slot overrides.
- `extraOptions` — TestForge execution controls and targeted plugin overlays.

Every property is optional, but `factory.withOptions()` itself takes a configuration object. Use `factory.withOptions({})` for a mount with defaults, or simply `factory()` with the positional API.

> [!IMPORTANT]
> These two `withOptions()` methods operate at different levels: `testComponentFactory.withOptions()` **creates a factory**, while `factory.withOptions()` **mounts the component**. The latter is not a replacement for the former.

### Selecting a Preset

When the framework registers multiple named presets, you can select a default environment **once for the factory**:

```typescript
const factory = testComponentFactory.withOptions({
  component: MyComponent,
  presetKey: "integration", // Must be registered in createTestFramework({ presets }).
});
```

Then override the environment for one mount without changing the factory default:

```typescript
factory(); // Uses "integration".
factory.withOptions({
  extraOptions: { presetKey: "default" },
}); // Uses "default" for this mount only.
factory(); // Uses "integration" again.
```

**Where `presetKey` belongs depends on the stage:** it is top-level in the factory creation object, but nested under `extraOptions` when mounting. Do not pass `presetKey` directly to `factory.withOptions({ ... })`.

The positional APIs remain fully supported. For type contracts, configuration priorities, and plugin merge rules, see [Configuration & Advanced Usage](./configuration.md#testcomponentfactory-signature).

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
const factory = testComponentFactory.withOptions({
  component: MyComponent,
  defaultMountOptions: {
    plugins: {
      pinia: {
        initialState: { user: { id: 1 } },
      },
    },
  },
});
```

Here:

```text
pinia
→ managed plugin identifier

initialState
→ Pinia-specific configuration
```

The configuration belongs to the factory and is applied when it mounts the component. The equivalent positional creation call puts `plugins` in the third `defaultMountOptions` argument.

You can also provide plugin configuration for an individual test through `factory.withOptions({ mountOptions: ... })`:

```typescript
factory.withOptions({
  mountOptions: {
    plugins: {
      pinia: {
        initialState: { user: { id: 2 } },
      },
    },
  },
});
```

As with the positional API, the mount-level `mountOptions.plugins.pinia` configuration replaces the factory-level configuration for that plugin. For targeted shallow overrides instead, use `extraOptions.plugins` (see the [Configuration Guide](./configuration.md#managed-plugin-configuration)).

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
const factory = testComponentFactory.withOptions({
  component: MyComponent,
  defaultMountOptions: {
    plugins: { router: {} },
  },
});
```

The `router` key is valid because the Router plugin belongs to the active preset's manifest.

### Disabling a Plugin

You can also explicitly disable a managed plugin for a specific factory or test:

```typescript
factory.withOptions({
  mountOptions: {
    plugins: { router: false },
  },
});
```

This is useful when a plugin is normally active in the selected runtime environment but is not required for a particular test.

### Invalid Plugin Configuration

Managed plugins must be declared in the active preset's manifest. Configuring a plugin that is not declared in the manifest is invalid, even if its integration package is installed in the project.

> [!WARNING]
> **Unsupported Managed Plugin**
>
> If the active preset contains only Vue I18n, the following configuration is invalid because Pinia is not available:
>
> ```typescript
> factory.withOptions({
>   mountOptions: {
>     plugins: { pinia: {} },
>   },
> });
> ```

When multiple named presets are registered, plugin configuration is validated against the preset selected for the current mount.

When multiple named presets are registered, plugin configuration is validated against the preset selected for the current mount. See [Selecting a Preset](#selecting-a-preset) for details on factory-level selection and mount-level overrides.

---

## 7. 📚 Where to Go Next

Now that you have a basic TestForge setup, you can explore the more advanced parts of the framework:

- **[Configuration & Advanced Usage](./configuration.md)** — Learn how TestForge resolves configuration across presets, factories, tests, and extra options.
- **[Preset Authoring Guide](./preset-authoring-guide.md)** — Create project-specific, organization-wide, or reusable presets.
- **[Plugin Authoring Guide](./plugin-authoring-guide.md)** — Build custom managed plugins for TestForge.
