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
- the default configuration for those plugins.

The TestForge core does not automatically know about Vue ecosystem plugins. A plugin becomes available to the framework only when it is registered through the active preset.

For example, a preset can make Pinia, Vue Router, and Vue I18n available to your tests:

```typescript
import { presets } from "@testforgejs/vue-test-preset-recommended";
```

Presets can also build on top of other presets.

For example, the official recommended presets are composed from `@testforgejs/vue-test-preset-base`. The base package provides common Vue plugin configuration, while runner-specific recommended presets add configuration required by a particular test runner.

You do not need to understand this composition to get started. In most cases, you can simply use the preset that matches your test runner.

> [!TIP]
> Start with the recommended preset if you are new to TestForge. Create or extend a custom preset when you need more control over which plugins are available or how they are configured.

See the [Preset Authoring Guide](./preset-authoring-guide.md) for information about creating and composing custom presets.

---

## 3. 🧩 Integrating TestForge into a Project

It is recommended to create a single TestForge configuration file, usually `tests/setup.ts` or `tests/test-utils.ts`.

```typescript
// @/tests/setup.ts

import { createTestFramework } from "@testforgejs/vue-test-core";
import { presets } from "@testforgejs/vue-test-preset-recommended";

const { testComponentFactory } = createTestFramework({
  presets,
});

export { testComponentFactory };
```

This creates one shared TestForge framework configuration for your test suite.

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

| Parameter          | Type    | Default | Description                                                                |
| :----------------- | :------ | :------ | :------------------------------------------------------------------------- |
| `presets`          | object  | `{}`    | Preset registry containing the managed plugins available to the framework. |
| `shallowByDefault` | boolean | `false` | Use `shallowMount()` instead of `mount()` by default.                      |

---

## 4. 🏭 Creating a Reusable Component Factory

`testComponentFactory` creates a reusable factory for mounting a specific component.

You can create a factory once and reuse it across multiple tests. The factory can define common component props, slots, Vue Test Utils options, and managed plugin configuration that should be shared by the tests using that factory.

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

TestForge provides managed integrations for commonly used Vue ecosystem plugins.

TestForge provides managed integrations for Vue ecosystem plugins such as Pinia, Vue Router, Vue I18n, Vuetify, and PrimeVue.

Managed plugins can be configured through the preset and used through the TestForge plugin configuration API.

Unlike manually registered Vue Test Utils plugins, managed plugins can be created and configured by TestForge using the plugin definitions registered in the active preset.

### Configuring a Managed Plugin

For example, a Pinia plugin can be configured when creating a component factory:

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

See the documentation for the individual plugin packages for plugin-specific configuration:

- [`@testforgejs/vue-test-plugin-pinia`](../packages/vue-test-plugin-pinia/docs/api/README.md)
- [`@testforgejs/vue-test-plugin-router`](../packages/vue-test-plugin-router/docs/api/README.md)
- [`@testforgejs/vue-test-plugin-i18n`](../packages/vue-test-plugin-i18n/docs/api/README.md)
- [`@testforgejs/vue-test-plugin-vuetify`](../packages/vue-test-plugin-vuetify/docs/api/README.md)
- [`@testforgejs/vue-test-plugin-primevue`](../packages/vue-test-plugin-primevue/docs/api/README.md)

---

## 6. 🔌 Enabling and Disabling Managed Plugins

A managed plugin must be available in the active preset before it can be configured through the managed plugin API.

If a plugin is registered in the preset but disabled by default, you can enable it for a specific factory or test:

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

You can also explicitly disable a managed plugin for a specific test:

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

This is useful when a plugin is normally active in the project but is not required for a particular test.

> [!NOTE]
> Managed plugin configuration is validated against the active preset. Plugin names used in the `plugins` configuration must correspond to plugins registered in the preset.

---

## 7. 📚 Where to Go Next

Now that you have a basic TestForge setup, you can explore the more advanced parts of the framework:

- **[Configuration & Advanced Usage](./configuration.md)** — Learn how TestForge resolves configuration across presets, factories, tests, and extra options.
- **[Preset Authoring Guide](./preset-authoring-guide.md)** — Create project-specific or organization-wide presets.
- **[Plugin Authoring Guide](./plugin-authoring-guide.md)** — Build custom managed plugins for TestForge.
