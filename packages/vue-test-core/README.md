# @testforgejs/vue-test-core

> Core runtime & declarative testing infrastructure for Vue 3

`@testforgejs/vue-test-core` is the core runtime of **TestForge**. It provides the framework for creating reusable, type-safe component test factories and coordinating managed Vue ecosystem plugins.

The core package provides:

- type-safe `testComponentFactory` instances
- plugin registration and lifecycle management
- project-level preset configuration
- reusable component test factories
- a hierarchical configuration merge pipeline (Preset → Factory → Test → Extra)

The core package itself does **not** include or configure any Vue ecosystem plugins. Plugins are provided by separate TestForge plugin packages and made available to the framework through a **preset**.

## Installation

Choose your preferred package manager.

### pnpm

```bash
pnpm add -D @testforgejs/vue-test-core
```

### npm

```bash
npm install -D @testforgejs/vue-test-core
```

### Yarn

```bash
yarn add -D @testforgejs/vue-test-core
```

## Presets

A **preset** defines the managed plugins available to your TestForge runtime and provides their project-level default configuration.

The preset system separates the TestForge core from individual Vue ecosystem integrations. This means the core package does not need to know about Pinia, Vue Router, Vue I18n, Vuetify, PrimeVue, or other integrations unless they are explicitly registered through a preset.

TestForge provides an official recommended preset:

```bash
pnpm add -D @testforgejs/vue-test-preset-recommended
```

The recommended preset provides commonly used integrations such as:

- Pinia
- Vue Router
- Vue I18n

Additional integrations, such as Vuetify and PrimeVue, are available as separate plugin packages and can be included in your own preset configuration.

> [!TIP]
> The recommended preset is optional. If your project requires a different set of plugins or configurations, you can create a custom preset.

👉 See the [Getting Started Guide](https://github.com/testforgejs/testforge/blob/main/docs/getting-started.md) for the recommended setup and the [Preset Authoring Guide](https://github.com/testforgejs/testforge/blob/main/docs/preset-authoring-guide.md) for custom presets.

## Quick Usage

```typescript
// tests/setup.ts (or any other initialization file in your project)
import { createTestFramework } from "@testforgejs/vue-test-core";
import { presets } from "@testforgejs/vue-test-preset-recommended";

const { testComponentFactory } = createTestFramework({
  presets,
});

export { testComponentFactory };
```

The resulting `testComponentFactory` can then be imported and reused throughout your component tests.

```typescript
// MyComponent.spec.ts (example component test)
import { testComponentFactory } from "@/tests/setup";
import MyComponent from "@/components/MyComponent.vue";

const factory = testComponentFactory(MyComponent);

test("renders correctly", () => {
  const wrapper = factory();

  expect(wrapper.exists()).toBe(true);
});
```

👉 For a complete walkthrough, continue with the [Getting Started Guide](https://github.com/testforgejs/testforge/blob/main/docs/getting-started.md).

## Documentation

- [Getting Started Guide](https://github.com/testforgejs/testforge/blob/main/docs/getting-started.md) — Set up TestForge in a project and create reusable component test factories.
- [Configuration & Advanced Usage](https://github.com/testforgejs/testforge/blob/main/docs/configuration.md) — Learn about configuration layers, merge strategies, execution flags, and plugin lifecycle behavior.
- [Plugin Authoring Guide](https://github.com/testforgejs/testforge/blob/main/docs/plugin-authoring-guide.md) — Create custom TestForge plugins.
- [Preset Authoring Guide](https://github.com/testforgejs/testforge/blob/main/docs/preset-authoring-guide.md) — Create custom presets for your project or organization.

## Project

This package is part of the **TestForge** monorepo.

- **[TestForge Project Overview](https://github.com/testforgejs/testforge#readme)** — project overview, package ecosystem, roadmap and repository information.
- **Repository:** https://github.com/testforgejs/testforge

## Related packages

- `@testforgejs/vue-test-preset-recommended`
- `@testforgejs/vue-test-plugin-router`
- `@testforgejs/vue-test-plugin-pinia`
- `@testforgejs/vue-test-plugin-i18n`
- `@testforgejs/vue-test-plugin-vuetify`
- `@testforgejs/vue-test-plugin-primevue`

## License

MIT
