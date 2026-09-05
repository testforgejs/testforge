# @testforgejs/vue-test-core

> Core runtime and declarative testing infrastructure for Vue 3.

`@testforgejs/vue-test-core` is the core runtime of **TestForge**. It provides the framework for creating reusable, type-safe component test factories and coordinating managed Vue ecosystem plugins.

The core package provides:

- type-safe `testComponentFactory` instances;
- plugin registration and lifecycle management;
- preset-based runtime configuration;
- reusable component test factories;
- a hierarchical configuration resolution pipeline:
  **Preset → Factory → Test → Extra Options**.

The core package itself does **not** include or configure Vue ecosystem plugins. Plugin integrations are provided by separate TestForge packages and become available to the framework through presets.

> Core defines the runtime. Plugins define integrations. Base presets define shared environments. Runner-specific recommended presets add runner-specific behavior. The host application provides Vue ecosystem dependencies.

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

> [!NOTE]
> TestForge requires **[Vue](https://vuejs.org/) 3.3.0 or higher**.
>
> `vue` and `@vue/test-utils` are peer dependencies of `@testforgejs/vue-test-core`. Make sure they are installed in your project.

For most projects, you will also want to install a preset package that defines the managed Vue plugins available to your tests.

---

## Presets

A **preset** defines a TestForge runtime environment.

A preset controls:

- which managed plugins are available;
- which plugins are enabled by default;
- the default configuration for those plugins.

The preset system keeps the TestForge core independent from specific Vue ecosystem integrations. The core runtime does not need built-in knowledge of Pinia, Vue Router, Vue I18n, Vuetify, PrimeVue, or other integrations.

### Official preset packages

TestForge provides a layered preset architecture:

```text
@testforgejs/vue-test-preset-base
            │
            ├── @testforgejs/vue-test-preset-recommended
            │       Vitest defaults
            │
            └── @testforgejs/vue-test-preset-recommended-jest
                    Jest defaults
```

`@testforgejs/vue-test-preset-base` provides shared Vue plugin configuration.

Runner-specific recommended presets build on top of the base presets and add configuration required by a particular test runner.

For example, the recommended Vitest preset provides `vi.fn` as the Pinia `createSpy` implementation.

### Recommended presets

For Vitest:

```bash
pnpm add -D @testforgejs/vue-test-preset-recommended
```

For Jest:

```bash
pnpm add -D @testforgejs/vue-test-preset-recommended-jest
```

The recommended presets include configurations for commonly used managed integrations such as:

- Pinia;
- Vue I18n;
- Vue Router.

The recommended preset packages are optional. You can also use the base presets directly or create and compose your own presets.

> [!TIP]
> If you are getting started with TestForge, use the recommended preset that matches your test runner.

See the [Getting Started Guide](https://github.com/testforgejs/testforge/blob/main/docs/getting-started.md) for the recommended setup and the [Preset Authoring Guide](https://github.com/testforgejs/testforge/blob/main/docs/preset-authoring-guide.md) for creating and composing custom presets.

---

## Quick Usage

The following example uses Vitest and the recommended Vitest preset.

```typescript
// tests/setup.ts

import { createTestFramework } from "@testforgejs/vue-test-core";
import { presets } from "@testforgejs/vue-test-preset-recommended";

const { testComponentFactory } = createTestFramework({
  presets,
});

export { testComponentFactory };
```

The resulting `testComponentFactory` can then be imported and reused throughout your component tests.

```typescript
// MyComponent.spec.ts

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

For Jest projects, use `@testforgejs/vue-test-preset-recommended-jest` instead.

👉 For a complete walkthrough, continue with the [Getting Started Guide](https://github.com/testforgejs/testforge/blob/main/docs/getting-started.md).

## Documentation

- [Getting Started Guide](https://github.com/testforgejs/testforge/blob/main/docs/getting-started.md) — Set up TestForge in a project and create reusable component test factories.
- [Configuration & Advanced Usage](https://github.com/testforgejs/testforge/blob/main/docs/configuration.md) — Learn about configuration layers, merge strategies, execution controls, and plugin lifecycle behavior.
- [Preset Authoring Guide](https://github.com/testforgejs/testforge/blob/main/docs/preset-authoring-guide.md) — Create and compose custom presets.
- [Plugin Authoring Guide](https://github.com/testforgejs/testforge/blob/main/docs/plugin-authoring-guide.md) — Create custom TestForge plugins.

## Project

This package is part of the **TestForge** monorepo.

- **[TestForge Project Overview](https://github.com/testforgejs/testforge#readme)** — Project overview, package ecosystem, roadmap, and repository information.
- **Repository:** https://github.com/testforgejs/testforge

## Related Packages

### Presets

- `@testforgejs/vue-test-preset-base`
- `@testforgejs/vue-test-preset-recommended`
- `@testforgejs/vue-test-preset-recommended-jest`

### Managed Plugins

- `@testforgejs/vue-test-plugin-pinia`
- `@testforgejs/vue-test-plugin-i18n`
- `@testforgejs/vue-test-plugin-router`
- `@testforgejs/vue-test-plugin-vuetify`
- `@testforgejs/vue-test-plugin-primevue`

## License

MIT
