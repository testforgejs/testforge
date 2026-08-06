# TestForge

## Declarative Test Infrastructure for Vue

> A test framework layer on top of [@vue/test-utils](https://test-utils.vuejs.org/) that eliminates mount boilerplate and scales Vue test architecture.

> [!IMPORTANT]
> **The Problem**: **Vue Test Utils** is excellent, but configuring Pinia, Router, i18n and other plugins repeatedly across test suites quickly becomes repetitive and error-prone.

> [!NOTE]
> **The Solution**: **TestForge** provides a preset-driven runtime that keeps plugin configuration consistent while preserving full Vue Test Utils compatibility.

---

## Table of Contents

- [The problem every Vue project eventually hits](#the-problem)
- [Quick Start](#quick-start)
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

> Vue Test Utils forces you to maintain dozens of massive, slightly different configuration objects.
> You end up copy-pasting 30 lines of `mount()` boilerplate just to change a single boolean flag or locale string.

Now multiply this by 200+ tests. Your test suite becomes a nightmare to maintain:

- **Fragile Setup**: Changing a global dependency breaks 50 tests in unrelated files.
- **Hidden Intent**: The actual test logic is buried under a mountain of infrastructure wiring.
- **Maintenance Tax**: A simple refactor requires updating hundreds of boilerplate lines.

Your tests no longer describe what a component _does_.  
They describe **how to rebuild your entire enterprise Vue stack** from scratch.

---

<a id="quick-start"></a>

# Quick Start

The fastest way to get started is to install the core framework along with the recommended preset. The preset automatically includes official plugins for **Pinia**, **Vue Router**, and **vue-i18n**.

## Install Dependencies

npm install -D @testforgejs/vue-test-core @testforgejs/vue-test-preset-recommended

## Initialize the Framework

Create a configuration file (e.g., `tests/setup.ts`) to initialize the framework with the recommended preset and export your testing factory:

```typescript
@/tests/setup.ts
import { createTestFramework } from "@testforgejs/vue-test-core";
import { presets } from "@testforgejs/vue-test-preset-recommended";

const { testComponentFactory } = createTestFramework({ presets });

export testComponentFactory;
```

## Write Your First Test

Now you can import your custom factory inside your `*.test.ts` or `*.spec.ts` files to easily mount and test your Vue components:

```typescript
import { testComponentFactory } from "./setup";
import MyComponent from "@/components/MyComponent.vue";

// Create a configured factory for the component
const factory = testComponentFactory(MyComponent);

test("renders correctly", () => {
  // Mount the component with presets automatically applied
  const wrapper = factory();

  // Your Vitest assertions here
  expect(wrapper.exists()).toBe(true);
});
```

## Why TestForge?

- **Zero boilerplate** — tests describe _what_ is being tested, not _how_ to set up the entire stack
- **Consistent environments** via presets
- **Safe overrides** with a clear hierarchy (Preset → Factory → Test)
- **Full VTU compatibility** — painless two-step migration
- **Type safety** out of the box

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

---

<a id="multiple-test-environments"></a>

# Multiple Test Environments

Large applications often contain several independent testing contexts.

For example:

- application components that use the full application stack
- isolated UI components that don't need Vue Router
- design-system components using only PrimeVue or Vuetify
- admin modules with additional plugins
- package-level tests inside a monorepo

Instead of forcing every test to use one global configuration, TestForge allows you to create multiple independent framework instances.

Each framework owns its own:

- preset registry
- managed plugin graph
- default plugin configuration
- mounting pipeline

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

Tests simply import the factory that matches their environment:

```typescript
import { appFactory } from "@/tests/app";

const factory = appFactory(MyComponent);
```

```typescript
import { dsFactory } from "@/tests/design-system";

const factory = dsFactory(Button);
```

Because every framework instance is isolated, changing presets or plugin defaults in one environment never affects another.

> [!TIP]
> Most projects only need a single framework instance. Multiple environments become useful for large applications, monorepos, shared UI libraries, or projects that require different managed plugin sets.

---

<a id="context-aware-overrides"></a>

# The Idea: Context-Aware Overrides

TestForge introduces one simple shift in perspective:

> Separate the environment baseline from the specific test delta.

You define the infrastructure baseline **once** in a centralized factory. Individual tests never touch `global.plugins`. Instead, they pass lightweight, context-aware overrides that TestForge safely merges via its deterministic pipeline.

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
        createTestingPinia({ initialState: { user: { loggedIn: true } } }),
        createRouter({ history: createMemoryHistory() }),
      ],
    },
  });
});

// Test 2: Testing French locale (30 lines copied just to change 'en' to 'fr')
it("renders French greeting", () => {
  const wrapper = mount(MyComponent, {
    global: {
      plugins: [
        createI18n({ locale: "fr", messages }), // 👈 The only changed line!
        createTestingPinia({ initialState: { user: { loggedIn: true } } }),
        createRouter({ history: createMemoryHistory() }),
      ],
    },
  });
});
```

## ✅ The TestForge Way (Clean Deltas)

You initialize a **reusable test factory** for the component. It pre-configures your standard Pinia, Router, and i18n via presets:

```typescript
const factory = testComponentFactory(MyComponent);
```

Now, your tests only declare **what changes**, keeping the setup purely declarative and laser-focused:

```typescript
// Test 1: Uses project defaults automatically
it("renders English greeting", () => {
  const wrapper = factory();
});

// Test 2: Safely overrides ONLY the i18n locale layer
it("renders French greeting", () => {
  const wrapper = factory({}, { i18n: { locale: "fr" } }); // 👈 Pure intent
});

// Test 3: Mutates only the required Pinia state block
it("renders guest view", () => {
  const wrapper = factory({}, { pinia: { initialState: { user: { loggedIn: false } } } });
});
```

---

<a id="core-concepts"></a>

# Core Concepts

TestForge is built around a few ideas that work together.  
Individually they are simple. Together they remove almost all test setup noise.

---

<a id="test-component-factory"></a>

## Test Component Factory

The **Test Component Factory** is the entry point you use in tests.

You don’t call `mount` from [@vue/test-utils](https://test-utils.vuejs.org/) directly anymore.  
You create a factory once and reuse it.

```typescript
const factory = testComponentFactory(MyComponent);
```

Then in tests:

```typescript
factory({ title: "Hello" });
```

The factory:

- merges props
- applies presets
- activates plugins
- builds `global` config
- chooses `mount` / `shallowMount`
- runs the **Mount Pipeline**

All without the test knowing how.

> The test only describes what it wants, not how to assemble Vue.

---

<a id="plugin-system"></a>

## Plugin System

TestForge treats i18n, Pinia, Router and any future integration as **plugins**.

A plugin is not a Vue plugin.  
It is a **test-environment builder**.

Each plugin:

- has a name
- knows how to create its Vue instance
- participates in the **Mount Pipeline**

Examples provided by TestForge:

- @testforgejs/vue-test-plugin-i18n
- @testforgejs/vue-test-plugin-pinia
- @testforgejs/vue-test-plugin-router

Because of this, TestForge can:

- validate plugin options
- control activation
- merge configs safely
- allow overrides without breaking defaults

---

<a id="presets"></a>

## Presets

A preset is a declarative description of a test environment.

It defines:

- which plugins exist
- which are enabled by default
- their default options

Example idea:

```typescript
// Example:
const presets = {
  default: {
    manifest: [
      { module: piniaPlugin, enabled: true },
      { module: i18nPlugin, enabled: true },
      { module: routerPlugin, enabled: false },
    ],
    defaults: {
      i18n: { locale: "en" },
      pinia: {
        /* initial state */
      },
    },
  },
};
```

Presets allow you to:

- share environment rules across the project
- switch environment in one line
- create lightweight or specialized test setups

TestForge provides:

- @testforgejs/vue-test-preset-recommended

You can create your own presets for your organization or monorepo.

---

<a id="mount-pipeline"></a>

## Mount Pipeline

The **Mount Pipeline** is the internal engine that prepares the final mount options.

It is a deterministic sequence of middleware that:

1. Selects preset
2. Validates plugins
3. Resolves activation rules
4. Merges defaults, overrides, and extra options
5. Builds `global.plugins`, `global.stubs`, `global.mocks`
6. Produces clean options for `mount`

Because this is centralized:

- merge logic is predictable
- overrides behave consistently
- edge cases are tested once in TestForge, not in every project

---

<a id="default-vs-override-philosophy"></a>

## Default vs Override Philosophy

TestForge follows a strict rule:

> Defaults should work for 90% of tests. Overrides should be explicit and safe.

This means:

- Empty options do something meaningful
- Providing an object can **override**, **extend**, or **reset** behavior depending on context
- Extra options can re-enable or reconfigure plugins safely
- Tests don’t need to know preset internals

You don’t fight the framework.  
You ask for what you need, and TestForge merges it correctly.

---

<a id="incremental-migration"></a>

# Incremental Migration from Vue Test Utils

TestForge is intentionally engineered as a **drop-in architecture extension**, not a destructive replacement. It features 100% backward compatibility with standard [Vue Test Utils (VTU)](https://vuejs.org) configuration formats.

You can migrate your existing test suites in two effortless, risk-free stages.

---

## Stage 1: Zero-Refactor Integration (1:1 Translation)

In the first stage, you don't need to change your existing setup objects. TestForge treats raw VTU configuration objects as valid input and processes them identically to `mount()`.

If your legacy VTU test looks like this:

```typescript
import { mount } from "@vue/test-utils";
import MyComponent from "./MyComponent.vue";

const VTUConfig = {
  props: { title: "Hello" },
  global: {
    mocks: { $t: (msg) => msg },
  },
};

const wrapper = mount(MyComponent, VTUConfig);
```

The immediate TestForge equivalent is exactly the same, routed through a reusable factory:

```typescript
import { testComponentFactory } from "@/tests/setup"; // Your bootstrapped factory
import MyComponent from "./MyComponent.vue";

const factory = testComponentFactory(MyComponent);

// Pass an empty object as the 1st argument (props) to let TestForge
// safely process the props directly out of your legacy VTUConfig block.
const wrapper = factory({}, VTUConfig);
```

At this stage, your tests will continue to pass exactly as they did before, with zero rewrite tax.

---

## Stage 2: Extracting the Baseline (Unlocking TestForge)

Once your tests run safely on the TestForge engine, you can incrementally refactor them to destroy boilerplate. You do this by extracting shared infrastructure into the factory creation level and leaving only the precise changes (deltas) in the individual tests.

### 1. Move global configurations to the Factory level:

```typescript
// Do this once per test file (or move plugins to your global project Preset)
const factory = testComponentFactory(
  MyComponent,
  {},
  {
    global: {
      mocks: { $t: (msg) => msg }, // Unified baseline
    },
  },
);
```

### 2. Clean up individual test invocations:

```typescript
// Now your tests only declare direct, meaningful state definitions
const wrapper = factory({ title: "Hello" });
```

By transitioning from Stage 1 to Stage 2, your test block shrinks from a heavy infrastructure-building machine down to a **one-line declarative intent**.

> ## Behavior parity with Vue Test Utils
>
> TestForge intentionally maintains compatibility with Vue Test Utils behavior and types to simplify migration and enable incremental adoption.

---

<a id="principles"></a>

# Principles

> ## Behavior parity with Vue Test Utils
>
> TestForge intentionally preserves Vue Test Utils behavior and typing semantics to simplify migration. Existing VTU configurations should continue to work unchanged, allowing TestForge features to be adopted incrementally.

> ## Plugin-first architecture
>
> Plugins are first-class citizens and can contribute runtime behavior, configuration, and type augmentation.

> ## Strong typing
>
> TypeScript types are inferred from components and plugins whenever possible.

> ## Opt-in abstractions
>
> TestForge extends Vue Test Utils rather than replacing it. Users can adopt additional abstractions only when they provide value.

---

<a id="faq"></a>

# FAQ

## Literal types inside data()

When using union literal types in component state:

```typescript
data() {
  return {
    status: "idle" as "idle" | "loading" | "success",
  };
}
```

TypeScript may widen string literals when overriding data():

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

which produces:

```log
Type 'string' is not assignable to
'idle' | 'loading' | 'success'
```

This behavior is inherited from Vue Test Utils and TypeScript itself.

To preserve literal types, use:

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
