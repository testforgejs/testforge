# 🚀 Getting Started with TestForge

This guide walks you through the basic TestForge workflow: installing TestForge, configuring a project preset, creating reusable component factories, and using managed Vue ecosystem plugins in your tests.

By the end of this guide, you will have a shared `testComponentFactory` that can be reused across your component tests and configured with project-wide plugin defaults and test-specific options.

## 1. 📦 Installation

Install the TestForge core and the recommended preset:

```bash
pnpm add -D @testforge/vue-test-core @testforge/vue-test-preset-recommended
```

You can also use `npm` or `yarn` if they are used by your project.

The core package provides the TestForge runtime and factory system. The recommended preset provides a ready-to-use set of commonly used managed Vue ecosystem plugins.

---

## 2. 🧩 Understanding Presets

Before creating your TestForge framework, it is important to understand the role of a **preset**.

A preset defines:

- which managed plugins are available in the test environment;
- which plugins are enabled by default;
- the default configuration for those plugins.

The TestForge core does not automatically know about Vue ecosystem plugins. A plugin becomes available to the framework only when it is registered through the active preset.

For example, a preset can make Pinia, Vue Router, and Vue I18n available to your tests:

```typescript
import { presets } from "@testforge/vue-test-preset-recommended";
```

You can use the official recommended preset or create your own project-specific preset.

> [!TIP]
> Start with the recommended preset if you are new to TestForge. Create a custom preset when you need control over which plugins are available or how they are configured.

See the [Preset Authoring Guide](./preset-authoring-guide.md) for information about creating custom presets.

---

## 3. 🧩 Integrating TestForge into a Project

It is recommended to create a single TestForge configuration file, usually `tests/setup.ts` or `tests/test-utils.ts`.

```typescript
// @/tests/setup.ts
import { createTestFramework } from "@testforge/vue-test-core";
import { presets } from "@testforge/vue-test-preset-recommended";

const { testComponentFactory } = createTestFramework({
  presets,
});

export { testComponentFactory };
```

This creates one shared TestForge framework configuration for your test suite.

You can then import the configured factory into your tests:

```typescript
import { testComponentFactory } from "@/tests/setup";
import MyComponent from "@/components/MyComponent.vue";

const factory = testComponentFactory(MyComponent);

test("renders correctly", () => {
  const wrapper = factory();

  expect(wrapper.exists()).toBe(true);
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
test("renders the custom title", () => {
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

- [`@testforge/vue-test-plugin-pinia`](../packages/vue-test-plugin-pinia/docs/api/README.md)
- [`@testforge/vue-test-plugin-router`](../packages/vue-test-plugin-router/docs/api/README.md)
- [`@testforge/vue-test-plugin-i18n`](../packages/vue-test-plugin-i18n/docs/api/README.md)
- [`@testforge/vue-test-plugin-vuetify`](../packages/vue-test-plugin-vuetify/docs/api/README.md)
- [`@testforge/vue-test-plugin-primevue`](../packages/vue-test-plugin-primevue/docs/api/README.md)

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
