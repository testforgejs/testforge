# TestForge

## Declarative Test Infrastructure for Vue

> A test framework layer on top of [@vue/test-utils](https://test-utils.vuejs.org/) that eliminates mount boilerplate and scales Vue test architecture.

> [!IMPORTANT]
>
> **The Problem**: **Vue Test Utils** is excellent, but configuring Pinia, Router, i18n and other plugins repeatedly across test suites quickly becomes repetitive and error-prone.

> [!NOTE]
>
> **The Solution**: **TestForge** provides a preset-driven runtime that keeps plugin configuration consistent while preserving Vue Test Utils compatibility.
>
> Presets can be composed, allowing shared Vue plugin configuration to live in a common base preset while runner-specific presets add behavior required by tools such as Vitest or Jest.

> [!NOTE]
>
> **TestForge architecture**
>
> - **Core** defines the runtime.
> - **Plugins** define Vue ecosystem integrations.
> - **Base presets** define shared test environments.
> - **Runner-specific recommended presets** add behavior required by a particular test runner.
> - **The host application** provides Vue ecosystem dependencies.
>
> This separation allows shared Vue testing configuration to be reused across different test runners without duplicating plugin configuration.

---

## Table of Contents

- [The problem every Vue project eventually hits](#the-problem)
- [Quick Start](#quick-start)
- [Why TestForge?](#why-testforge)
- [Documentation](#documentation)
- [Multiple Test Environments](#multiple-test-environments)
- [The Idea: Context-Aware Overrides](#context-aware-overrides)
- [Before / After Example](#before-after)
- [Core Concepts](#core-concepts)
  - [Test Component Factory](#test-component-factory)
  - [Plugin System](#plugin-system)
  - [Presets](#presets)
  - [Mount Pipeline](#mount-pipeline)
  - [Default vs Override Philosophy](#default-vs-override-philosophy)
- [Incremental Migration from Vue Test Utils](#incremental-migration)
- [Principles](#principles)
- [FAQ](#faq)

---

<a id="the-problem"></a>

# The problem every Vue project eventually hits

At the beginning, Vue tests look clean.

A simple component test:

```typescript
mount(MyComponent);
```

A few weeks later, real app infrastructure appears: i18n, Pinia, Router, stubs, and global mocks.

Suddenly, you hit the **Configuration Explosion** problem.

To test different behaviors of the _same_ component, you need slightly different environments:

- Test A needs a clean Pinia store.
- Test B needs the same store, but with one specific action mocked.
- Test C needs i18n set to `fr` instead of `en`.
- Test D needs the router to start on a specific protected path.

> Vue Test Utils gives you the flexibility to configure all of this, but the test suite can end up maintaining dozens of large, slightly different configuration objects.

> You end up copy-pasting 30 lines of `mount()` boilerplate just to change a single boolean flag or locale string.

Now multiply this by 200+ tests. Your test suite becomes difficult to maintain:

- **Fragile Setup**: Changing shared infrastructure can affect many unrelated tests.
- **Hidden Intent**: The actual test logic is buried under infrastructure wiring.
- **Maintenance Tax**: A simple refactor requires updating hundreds of boilerplate lines.

Your tests no longer describe what a component _does_.

They describe **how to rebuild your entire Vue test environment** from scratch.

---

<a id="quick-start"></a>

# Quick Start

The quickest way to get started is to use TestForge with **Vitest** and the official recommended Vitest preset.

The recommended preset builds on the shared TestForge base presets and provides Vitest-specific defaults where required.

## Install Dependencies

Install TestForge and Vue Test Utils:

```bash
pnpm add -D \
  @testforgejs/vue-test-core \
  @testforgejs/vue-test-preset-recommended \
  @vue/test-utils
```

> [!NOTE]
> TestForge requires [Vue](https://vuejs.org/) 3.3.0 or higher and [Vue Test Utils](https://test-utils.vuejs.org/) 2.0.0 or higher.
>
> Vue is normally already installed as part of your Vue application. Vue Test Utils should be added to your development dependencies.

> [!NOTE]
>
> This example assumes that Vitest is already installed and configured with a DOM-like environment such as `happy-dom` or `jsdom`.
>
> TestForge mounts Vue components through Vue Test Utils, so component tests require a browser-like test environment.

For example:

```typescript
// vitest.config.ts

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "happy-dom",
  },
});
```

If your project uses Jest instead of Vitest, use `@testforgejs/vue-test-preset-recommended-jest`.

## Initialize the Framework

Create a configuration file, for example `tests/setup.ts`, and initialize TestForge with the recommended preset:

```typescript
// tests/setup.ts

import { createTestFramework } from "@testforgejs/vue-test-core";
import { presets } from "@testforgejs/vue-test-preset-recommended";

const { testComponentFactory } = createTestFramework({
  presets,
});

export { testComponentFactory };
```

The preset registry defines the managed Vue plugins available to your tests and their default configuration.

## Write Your First Test

You can now create a reusable component factory:

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

---

<a id="why-testforge"></a>

# Why TestForge?

- **Less boilerplate** — tests describe _what_ is being tested instead of repeatedly rebuilding application infrastructure.
- **Consistent environments** — presets provide a shared baseline for managed Vue ecosystem plugins.
- **Safe overrides** — configuration follows a clear hierarchy from project defaults to individual test configuration.
- **Composable presets** — shared plugin configuration can be reused across projects and extended with runner-specific behavior.
- **Vue Test Utils compatibility** — existing VTU configuration can be adopted incrementally.
- **Type safety** — component and plugin configuration remains strongly typed.
- **Isolated configuration** — plugin option factories produce fresh options for independent pipeline contexts, while component factory invocations create independent runtime environments.

---

<a id="documentation"></a>

# Documentation

TestForge documentation is organized into several focused guides.

## Getting Started

- [Getting Started](docs/getting-started.md)
- [Configuration & Advanced Usage](docs/configuration.md)

## Extending TestForge

- [Plugin Authoring Guide](docs/plugin-authoring-guide.md) — Create custom TestForge plugins
- [Preset Authoring Guide](docs/preset-authoring-guide.md) — Create custom presets for your project or organization

## Package Documentation

- [@testforgejs/vue-test-core](packages/vue-test-core/README.md)
- [@testforgejs/vue-test-preset-base](packages/vue-test-preset-base/README.md)
- [@testforgejs/vue-test-preset-recommended](packages/vue-test-preset-recommended/README.md)
- [@testforgejs/vue-test-preset-recommended-jest](packages/vue-test-preset-recommended-jest/README.md)

---

<a id="multiple-test-environments"></a>

# Multiple Test Environments

Large applications often contain several independent testing contexts.

For example:

- application components that use the full application stack;
- isolated UI components that don't need Vue Router;
- design-system components using only PrimeVue or Vuetify;
- admin modules with additional plugins;
- package-level tests inside a monorepo.

Instead of forcing every test to use one global configuration, TestForge allows you to create multiple independent framework instances.

Each framework owns its own:

- preset registry;
- managed plugin graph;
- default plugin configuration;
- mounting pipeline.

```typescript
// tests/app.ts

import { createTestFramework } from "@testforgejs/vue-test-core";
import { appPresets } from "./presets/app";

export const { testComponentFactory: appFactory } = createTestFramework({
  presets: appPresets,
});
```

```typescript
// tests/design-system.ts

import { createTestFramework } from "@testforgejs/vue-test-core";
import { designSystemPresets } from "./presets/design-system";

export const { testComponentFactory: dsFactory } = createTestFramework({
  presets: designSystemPresets,
});
```

Tests simply import the component factory that matches their environment:

```typescript
import { appFactory } from "@/tests/app";

const factory = appFactory(MyComponent);
```

```typescript
import { dsFactory } from "@/tests/design-system";

const factory = dsFactory(Button);
```

Because every framework instance is isolated, changing presets or plugin defaults in one environment does not affect another.

> [!TIP]
>
> Most projects only need a single framework instance. Multiple environments become useful for large applications, monorepos, shared UI libraries, or projects that require different managed plugin sets.

---

<a id="context-aware-overrides"></a>

# The Idea: Context-Aware Overrides

TestForge introduces one simple shift in perspective:

> Separate the environment baseline from the specific test delta.

You define the infrastructure baseline **once** in a centralized preset and reusable component factory. Individual tests then provide only the configuration they need to change.

Managed plugin configuration is expressed through TestForge's `plugins` API rather than repeatedly rebuilding `global.plugins`.

This keeps test configuration focused on intent while the Mount Pipeline handles the resulting runtime configuration.

---

<a id="before-after"></a>

# Before / After Example

## ❌ Vue Test Utils way (Configuration Explosion)

Look how much boilerplate you copy-paste across tests just to adjust _one_ tiny detail:

```typescript
// Test 1: Testing English locale

it("renders English greeting", () => {
  const wrapper = mount(MyComponent, {
    global: {
      plugins: [
        createI18n({ locale: "en", messages }),
        createTestingPinia({
          initialState: { user: { loggedIn: true } },
        }),
        createRouter({
          history: createMemoryHistory(),
        }),
      ],
    },
  });
});

// Test 2: Testing French locale

it("renders French greeting", () => {
  const wrapper = mount(MyComponent, {
    global: {
      plugins: [
        createI18n({ locale: "fr", messages }),
        createTestingPinia({
          initialState: { user: { loggedIn: true } },
        }),
        createRouter({
          history: createMemoryHistory(),
        }),
      ],
    },
  });
});
```

## ✅ The TestForge Way (Clean Deltas)

You initialize a **reusable component factory** for the component. The selected preset provides the managed plugin baseline:

```typescript
const factory = testComponentFactory(MyComponent);
```

Tests can then provide only the configuration that changes:

```typescript
// Test 1: Uses project defaults automatically

it("renders English greeting", () => {
  const wrapper = factory();
});

// Test 2: Replaces the managed i18n configuration for this test

it("renders French greeting", () => {
  const wrapper = factory(
    {},
    {
      plugins: {
        i18n: {
          locale: "fr",
        },
      },
    },
  );
});
```

For a targeted adjustment that should preserve the already resolved managed plugin configuration, use the fourth `extraOptions` argument:

```typescript
// Adjust only the resolved Pinia configuration

it("renders guest view", () => {
  const wrapper = factory(
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
});
```

The distinction is important:

- `mountOptions.plugins` **replaces** the corresponding managed plugin configuration at the test layer.
- `extraOptions.plugins` applies a **shallow overlay** to the already resolved managed plugin configuration.

---

<a id="core-concepts"></a>

# Core Concepts

TestForge is built around a few ideas that work together.

Individually they are simple. Together they remove most test setup noise.

---

<a id="test-component-factory"></a>

## Test Component Factory

The **Test Component Factory** is the entry point you use in tests.

Instead of repeatedly calling `mount()` with a large configuration object, you create a reusable component factory once:

```typescript
const factory = testComponentFactory(MyComponent);
```

Then in tests:

```typescript
factory({
  title: "Hello",
});
```

The component factory:

- accepts test-specific props;
- resolves the selected preset;
- resolves managed plugin configuration;
- builds the Vue Test Utils `global` configuration;
- chooses `mount()` or `shallowMount()`;
- runs the **Mount Pipeline**.

The test only describes what it wants, not how to assemble the Vue runtime.

### Component Factory Invocations

A component factory can be invoked multiple times:

```typescript
const factory = testComponentFactory(MyComponent);

const first = factory();
const second = factory();
```

Each invocation creates its own runtime environment. Mutable plugin runtime state should not be shared between these invocations unless the test explicitly registers a shared instance through the appropriate Vue Test Utils mechanism.

This is **component factory invocation isolation**.

It is different from plugin options factory isolation described below.

---

<a id="plugin-system"></a>

## Plugin System

TestForge treats i18n, Pinia, Router and other integrations as **plugins**.

A plugin is not simply a Vue plugin.

It is a **test-environment builder** that participates in the TestForge runtime.

Each plugin:

- has a name;
- defines how its runtime is created;
- participates in the **Mount Pipeline**;
- can validate and resolve its configuration.

Examples provided by TestForge include:

- `@testforgejs/vue-test-plugin-pinia`;
- `@testforgejs/vue-test-plugin-i18n`;
- `@testforgejs/vue-test-plugin-router`;
- `@testforgejs/vue-test-plugin-vuetify`;
- `@testforgejs/vue-test-plugin-primevue`.

Because of this, TestForge can:

- validate plugin options;
- control activation;
- resolve plugin configuration;
- create isolated plugin runtime instances;
- allow explicit overrides without rebuilding the entire environment.

---

<a id="presets"></a>

## Presets

A preset is a declarative description of a TestForge runtime environment.

It defines:

- which managed plugins are available;
- which plugins are enabled by default;
- the baseline configuration for those plugins.

Plugin defaults are represented by **plugin options factories**, not shared configuration objects.

For example:

```typescript
const presets = {
  default: {
    manifest: [
      { module: piniaPlugin, enabled: true },
      { module: i18nPlugin, enabled: true },
      { module: routerPlugin, enabled: false },
    ],

    defaults: {
      pinia: () => ({
        initialState: {},
      }),

      i18n: () => ({
        locale: "en",
      }),
    },
  },
};
```

When a plugin options factory is invoked, it produces fresh options for the current pipeline context.

This prevents mutable configuration objects from being reused accidentally across independent pipeline executions.

Presets allow you to:

- share test environment configuration across a project;
- define lightweight or specialized test environments;
- switch the active preset for an individual component factory invocation;
- compose presets instead of duplicating shared configuration.

### Preset Composition

TestForge's official presets are organized in layers:

```text
@testforgejs/vue-test-preset-base
            │
            ├── @testforgejs/vue-test-preset-recommended
            │       Vitest defaults
            │
            └── @testforgejs/vue-test-preset-recommended-jest
                    Jest defaults
```

The base preset package contains shared Vue plugin configuration.

Runner-specific recommended presets build on top of the base presets and add configuration required by their respective test runners.

For example, the recommended Vitest preset provides `vi.fn` as the Pinia `createSpy` implementation, while the Jest preset provides the corresponding Jest implementation.

### Official Preset Packages

TestForge provides:

- `@testforgejs/vue-test-preset-base` — shared baseline presets for Vue ecosystem plugins;
- `@testforgejs/vue-test-preset-recommended` — recommended presets for Vitest;
- `@testforgejs/vue-test-preset-recommended-jest` — recommended presets for Jest.

You can also create and compose your own presets for a project, organization, or monorepo.

See the [Preset Authoring Guide](./docs/preset-authoring-guide.md) for more information.

---

<a id="mount-pipeline"></a>

## Mount Pipeline

The **Mount Pipeline** is the internal engine that prepares the final Vue Test Utils mount configuration.

It is a deterministic sequence of middleware that:

1. selects the active preset;
2. validates plugins and configuration;
3. resolves activation rules;
4. resolves plugin options factories;
5. merges defaults, overrides, and extra options according to their defined strategies;
6. builds `global.plugins`, `global.stubs`, and `global.mocks`;
7. produces the final options for `mount()` or `shallowMount()`.

Because this is centralized:

- merge logic is predictable;
- overrides behave consistently;
- edge cases are tested once in TestForge rather than independently in every project.

---

<a id="default-vs-override-philosophy"></a>

## Default vs Override Philosophy

TestForge follows a strict rule:

> Defaults should work for most tests. Overrides should be explicit and predictable.

This means:

- empty options should produce a useful default environment;
- local configuration can override the appropriate layer;
- managed plugin configuration uses explicit replacement or overlay semantics;
- tests don't need to know how the runtime environment is assembled.

You don't fight the framework.

You describe the configuration you need, and TestForge resolves it through the Mount Pipeline.

---

<a id="incremental-migration"></a>

# Incremental Migration from Vue Test Utils

TestForge is designed as an **architecture extension** rather than a destructive replacement.

It preserves standard Vue Test Utils configuration patterns where possible, while adding TestForge-specific preset and managed-plugin behavior.

You can migrate an existing test suite incrementally.

---

## Stage 1: Minimal-Change Integration

In the first stage, you can keep most of your existing Vue Test Utils mount configuration.

If your existing VTU test looks like this:

```typescript
import { mount } from "@vue/test-utils";
import MyComponent from "./MyComponent.vue";

const VTUConfig = {
  props: {
    title: "Hello",
  },

  global: {
    mocks: {
      $t: (msg) => msg,
    },
  },
};

const wrapper = mount(MyComponent, VTUConfig);
```

The TestForge equivalent can route the same VTU-style options through a reusable component factory:

```typescript
import { testComponentFactory } from "@/tests/setup";
import MyComponent from "./MyComponent.vue";

const factory = testComponentFactory(MyComponent);

const wrapper = factory({}, VTUConfig);
```

At this stage, the goal is simply to introduce the TestForge runtime without immediately redesigning every test.

---

## Stage 2: Extracting the Baseline

Once your tests run safely through TestForge, you can incrementally refactor them to remove repeated infrastructure.

Move shared configuration into the component factory or, where appropriate, into a preset.

For example:

```typescript
const factory = testComponentFactory(
  MyComponent,
  {},
  {
    global: {
      mocks: {
        $t: (msg) => msg,
      },
    },
  },
);
```

Individual tests can then focus on their specific inputs:

```typescript
const wrapper = factory({
  title: "Hello",
});
```

For shared managed plugin configuration, prefer preset defaults or `defaultMountOptions.plugins`.

By transitioning from Stage 1 to Stage 2, tests can shrink from infrastructure-heavy mount calls to concise declarative component factory invocations.

> [!NOTE]
>
> TestForge intentionally maintains compatibility with Vue Test Utils behavior and types where the corresponding configuration is part of the standard VTU API.

---

<a id="principles"></a>

# Principles

## Behavior parity with Vue Test Utils

TestForge intentionally preserves Vue Test Utils behavior and typing semantics where possible to simplify migration. Existing VTU configurations can be adopted incrementally.

## Plugin-first architecture

Plugins are first-class citizens and can contribute runtime behavior, configuration, and type augmentation.

## Preset-driven environments

Presets define complete managed-plugin runtime environments rather than partial configuration overlays.

The active preset determines the managed plugin capability boundary for the current component factory invocation.

## Plugin Options Factories

Preset `defaults` stores **plugin options factories**, not shared plugin configuration objects.

A plugin options factory is invoked for a pipeline context and produces fresh plugin options for that context.

This is **plugin options factory isolation**.

It should not be confused with component factory invocation isolation.

## Component Factory Invocation Isolation

A **component factory** is created by `testComponentFactory(Component)` and can be invoked repeatedly to mount the component.

Each component factory invocation creates an independent runtime environment.

This is **component factory invocation isolation**, and it is separate from the isolation of plugin options factories.

## Strong typing

TypeScript types are inferred from components and plugins whenever possible.

## Opt-in abstractions

TestForge extends Vue Test Utils rather than replacing it. Users can adopt additional abstractions only when they provide value.

---

<a id="faq"></a>

# FAQ

## Literal types inside `data()`

When using union literal types in component state:

```typescript
data() {
  return {
    status: "idle" as "idle" | "loading" | "success",
  };
}
```

TypeScript may widen string literals when overriding `data()`:

```typescript
testComponentFactory(
  Component,
  {},
  {
    data() {
      return {
        status: "loading",
      };
    },
  },
);
```

which can produce:

```text
Type 'string' is not assignable to
'idle' | 'loading' | 'success'
```

This behavior comes from Vue Test Utils and TypeScript's type inference.

To preserve the literal type, use:

```typescript
data() {
  return {
    status: "loading" as const,
  };
}
```

or:

```typescript
data() {
  return {
    status: "loading" as "idle" | "loading" | "success",
  };
}
```
