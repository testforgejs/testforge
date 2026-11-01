# @testforgejs/vue-test-core

> Core runtime and declarative testing infrastructure for Vue 3.

`@testforgejs/vue-test-core` is the core runtime of **TestForge**. It provides the framework for creating reusable, type-safe component test factories and coordinating managed Vue ecosystem plugins.

The core package provides:

- type-safe `testComponentFactory` instances with positional and object-based creation APIs;
- plugin registration and lifecycle management;
- preset-based runtime configuration with factory-level and per-mount selection;
- reusable component test factories;
- a hierarchical configuration resolution pipeline:
  **Preset → Factory → Test → Extra Options**.

The core package itself does **not** include or configure Vue ecosystem plugins. Plugin integrations are provided by separate TestForge packages and become available to the framework through presets.

Vue plugins without a dedicated TestForge integration can still be registered through the standard Vue Test Utils `global.plugins` option.

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

> [!NOTE]
> TestForge mounts Vue components through Vue Test Utils, so component tests require a DOM-like test environment.
>
> Configure your test runner with an environment such as `happy-dom` or `jsdom`.
>
> See the [Getting Started Guide](https://github.com/testforgejs/testforge/blob/main/docs/getting-started.md) for a complete Vitest setup.

For most projects, you will also want to install a preset package that defines the managed Vue plugins available to your tests.

---

## Presets

A **preset** defines a TestForge runtime environment.

A preset controls:

- which managed plugins are available;
- which plugins are enabled by default;
- the default configuration for those plugins.

The preset system keeps the TestForge core independent from specific Vue ecosystem integrations. The core runtime does not need built-in knowledge of Pinia, Vue Router, Vue I18n, Vuetify, PrimeVue, or other integrations.

### Single and Multiple Presets

`createTestFramework()` supports two mutually exclusive ways to configure presets.

Use `preset` when the framework needs a single runtime environment:

```typescript
createTestFramework({
  preset: projectPreset,
});
```

Use `presets` when the framework should provide multiple named runtime environments:

```typescript
createTestFramework({
  presets: {
    default: projectPreset,
    i18n: i18nPreset,
    router: routerPreset,
  },
});
```

These options cannot be used together.

A single `preset` is treated as the framework's `default` preset internally. A `presets` registry lets you choose a named environment **when creating a component factory** or **for an individual mount**.

For most components, choose the environment once at factory creation. Tests then inherit that environment without repeating the preset key:

```typescript
const { testComponentFactory } = createTestFramework({
  presets: {
    default: defaultPreset,
    i18n: i18nPreset,
  },
});

const factory = testComponentFactory.withOptions({
  component: MyComponent,
  presetKey: "i18n",
});

factory(); // Uses the i18n preset.
factory({}, {}, {}, { presetKey: "default" }); // Overrides it for one mount.
factory(); // Uses the i18n preset again.
```

Preset selection follows this precedence: **mount-level `extraOptions.presetKey` → factory-level `presetKey` → registered `default` preset**. Selecting a different preset replaces the active managed-plugin environment; it does not merge two presets.

An explicitly requested preset must be registered. A factory-level selection is checked when the factory is created, and a mount-level selection is checked for that mount. When the factory selects a preset explicitly, its `defaultMountOptions.plugins` must only configure plugins declared in that preset. When a mount-level override selects a preset that does not support a factory-default plugin, that default plugin configuration is ignored for that mount; plugins explicitly configured in `mountOptions.plugins` or `extraOptions.plugins` must be supported by the active preset.

This distinction allows a project to start with a single custom runtime environment and introduce named runtime profiles later without changing the preset definition itself. See [Configuration & Advanced Usage](https://github.com/testforgejs/testforge/blob/main/docs/configuration.md#testcomponentfactory-signature) for the complete API and validation rules.

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

The recommended preset is a convenient starting point for exploring TestForge and its approach to reusable component test environments.

However, recommended presets are intentionally generic. Real applications usually have application-specific routes, managed plugins, and plugin defaults. Most projects will therefore eventually benefit from a project-specific preset that extends or adapts an existing preset to the application's runtime environment.

The recommended preset packages are optional. You can also use the base preset directly or create your own project-specific preset.

> [!TIP]
> If you are getting started with TestForge, use the recommended preset that matches your test runner.

See the [Getting Started Guide](https://github.com/testforgejs/testforge/blob/main/docs/getting-started.md) for the recommended setup and the [Preset Authoring Guide](https://github.com/testforgejs/testforge/blob/main/docs/preset-authoring-guide.md) for creating and composing custom presets.

---

## Quick Usage

The following example uses Vitest and the recommended Vitest preset registry.

```typescript
// tests/setup.ts

import { createTestFramework } from "@testforgejs/vue-test-core";
import { presets } from "@testforgejs/vue-test-preset-recommended";

const { testComponentFactory } = createTestFramework({
  presets,
});

export { testComponentFactory };
```

This setup is a good starting point for exploring TestForge. As the application-specific testing environment grows, the project can define its own preset while continuing to reuse the official preset as a base.

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

### Component Factory Creation APIs

`testComponentFactory` supports both a **positional API** and an **object-based API**. They create the same reusable component factory. The object-based form is useful when you need to set several optional defaults or choose a preset for the component.

**Object-based API:**

```typescript
const factory = testComponentFactory.withOptions({
  component: MyComponent,
  presetKey: "i18n",
  defaultProps: { title: "Hello" },
  defaultMountOptions: { shallow: true },
  defaultSlots: { default: "Fallback content" },
});
```

**Equivalent positional API:**

```typescript
const factory = testComponentFactory(
  MyComponent,
  { title: "Hello" },
  { shallow: true },
  { default: "Fallback content" },
  { presetKey: "i18n" },
);
```

In both forms, the selected preset and defaults belong to the component factory. **Calling `factory()` is unchanged**; you can still override props, mount options, slots, or `extraOptions` for a single mount:

```typescript
factory(); // Uses factory defaults and the i18n preset.
factory({}, {}, {}, { presetKey: "default" }); // Uses default for this mount only.
```

The positional API remains supported; `withOptions()` is an alternative, not a replacement. See the [Configuration Guide](https://github.com/testforgejs/testforge/blob/main/docs/configuration.md#testcomponentfactory-signature) for argument details and further examples.

### Default Props and Test-Specific Overrides

TestForge allows you to define a shared set of component props once and override only the values relevant to each test scenario.

Pass `defaultProps` as the second argument to `testComponentFactory()`:

```typescript
const factory = testComponentFactory(UserCard, {
  name: "Alice",
  role: "user",
  isActive: true,
});
```

Each factory invocation inherits these defaults unless a specific prop is overridden:

```typescript
// Uses all default props.
const defaultWrapper = factory();

// Overrides only the role.
const adminWrapper = factory({
  role: "admin",
});

// Overrides only the active state.
const inactiveWrapper = factory({
  isActive: false,
});
```

Test-specific props take precedence over matching default props, while unspecified props retain their default values.

For example, `adminWrapper` receives:

```typescript
{
  name: "Alice",
  role: "admin",
  isActive: true,
}
```

**Each test can focus on the prop that drives its scenario without repeating the component's complete configuration.**

Overrides are resolved independently for each factory invocation, so changing a prop in one test does not change the defaults used by subsequent tests.

For more details about props resolution and configuration precedence, see [Props and Slots Priority](https://github.com/testforgejs/testforge/blob/main/docs/configuration.md#props-slots-priority).

---

## Using Vue Plugins Without TestForge Integrations

`@testforgejs/vue-test-core` builds on Vue Test Utils and does not restrict applications to plugins supported by TestForge-managed integrations.

Any Vue plugin that can be registered through Vue Test Utils `global.plugins` can be used with TestForge in the same way:

```typescript
const factory = testComponentFactory(
  MyComponent,
  {},
  {
    global: {
      plugins: [customVuePlugin],
    },
  },
);

const wrapper = factory();
```

Standard Vue plugins coexist with TestForge-managed plugins but remain outside the managed plugin lifecycle.

Use the managed `plugins` configuration for integrations declared in the active TestForge preset.
Use `global.plugins` for Vue plugins registered directly through Vue Test Utils.

A dedicated TestForge integration is only needed when a plugin should participate in TestForge's managed configuration and lifecycle mechanisms.

For more details, see [Third-Party Plugins](https://github.com/testforgejs/testforge/blob/main/docs/configuration.md#third-party-plugins).

---

## Project-Specific Presets

Most applications will eventually benefit from some application-specific preset configuration.

Plugin integrations imported directly by a project-specific preset must be installed as direct project dependencies.

For example, the following preset imports the Vue I18n integration directly:

```bash
pnpm add -D @testforgejs/vue-test-plugin-i18n
```

A project can then extend the recommended preset with its own locale configuration:

```typescript
import { extendPreset } from "@testforgejs/vue-test-core";
import { presets as recommendedPresets } from "@testforgejs/vue-test-preset-recommended";
import { PLUGIN_NAME as I18N_PLUGIN_NAME } from "@testforgejs/vue-test-plugin-i18n";

const projectPreset = extendPreset(recommendedPresets.default, {
  defaults: {
    [I18N_PLUGIN_NAME]: () => ({
      legacy: false,
      globalInjection: true,
      locale: "uk",
    }),
  },
});
```

---

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
