# TestForge

## Declarative Test Infrastructure for Vue

> A test framework layer on top of [@vue/test-utils](https://test-utils.vuejs.org/) that eliminates mount boilerplate and scales Vue test architecture.

> [!IMPORTANT]
>
> **The Problem**: **Vue Test Utils** is excellent, but configuring Pinia, Router, i18n, and other plugins repeatedly across test suites quickly becomes repetitive and error-prone.

> [!NOTE]
>
> **The Solution**: **TestForge** provides a preset-driven runtime that keeps plugin configuration consistent while preserving Vue Test Utils compatibility.
>
> Plugins own Vue ecosystem integration knowledge and may expose reusable project-independent defaults. TestForge-maintained presets can consume those defaults, while project-owned presets can materialize their concrete configuration directly in project source.

> [!NOTE]
>
> **TestForge architecture**
>
> - **Core** defines the runtime and Mount Pipeline.
> - **Plugins** define Vue ecosystem integrations and may expose reusable project-independent defaults.
> - **Base presets** consume runner-independent plugin defaults and compose reusable environments.
> - **Runner-specific recommended presets** consume runner-aware plugin defaults where required.
> - **Project presets** materialize concrete plugin configuration and add application-specific policy.
> - **The host application** provides Vue ecosystem dependencies.
>
> This separation keeps reusable library-specific integration knowledge inside plugins while allowing project-owned testing configuration to remain visible, editable, and stable in project source.

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
- Test B needs the same store, but with one specific action behavior.
- Test C needs i18n set to `fr` instead of `en`.
- Test D needs the router to start on a specific protected path.

> Vue Test Utils gives you the flexibility to configure all of this, but the test suite can end up maintaining dozens of large, slightly different configuration objects.
>
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

The recommended preset builds on the runner-independent TestForge base presets and supplies Vitest-specific integration where required.

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

Create a configuration file, for example `tests/setup.ts`, and initialize TestForge with the recommended default preset:

```typescript
// tests/setup.ts

import { createTestFramework } from "@testforgejs/vue-test-core";
import { presets } from "@testforgejs/vue-test-preset-recommended";

const { testComponentFactory } = createTestFramework({
  preset: presets.default,
});

export { testComponentFactory };
```

The selected preset defines the managed Vue plugin environment available to your tests.

For the common case of one runtime environment, `preset` is the simplest configuration form.

The recommended preset is intended as a convenient starting point. As an application grows, it can be replaced with a project-specific preset without changing the overall TestForge workflow:

```typescript
const { testComponentFactory } = createTestFramework({
  preset: projectPreset,
});
```

### Using a Custom Preset

TestForge does not require an official preset.

You can define a custom `PresetDefinition` using the TestForge plugin packages required by your project.

For example, a minimal Pinia-only Vitest environment requires the Pinia integration:

```bash
pnpm add -D @testforgejs/vue-test-plugin-pinia
```

TestForge does not include plugin integrations in `@testforgejs/vue-test-core`. Each managed Vue ecosystem integration is provided by its own package.

```typescript
// tests/setup.ts

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

The project-owned preset materializes its Pinia testing configuration directly:

```typescript
{
  createSpy: vi.fn,
}
```

This makes the effective configuration visible and editable in project source.

It also means that a future change to the Pinia plugin's reusable defaults does not silently change this project-owned preset.

Application-specific Pinia policy can be added directly when required.

For example, if the project wants real actions to execute instead of using the upstream testing behavior:

```typescript
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
      stubActions: false,
    }),
  },
} satisfies PresetDefinition;
```

This keeps the project's complete Pinia testing choice visible:

```text
createSpy: vi.fn
→ Vitest integration selected by the project

stubActions: false
→ project-specific action policy
```

Project-owned presets should normally materialize only the configuration they intentionally control.

They do not need to enumerate every option supported by the integrated library.

### `preset` vs `presets`

`createTestFramework()` supports two mutually exclusive configuration forms.

For a single runtime environment:

```typescript
createTestFramework({
  preset,
});
```

For multiple named runtime environments:

```typescript
createTestFramework({
  presets: {
    default: appPreset,
    designSystem: designSystemPreset,
  },
});
```

A single `preset` is internally treated as the framework's `default` preset.

Use:

```text
preset
→ one runtime environment

presets
→ multiple named runtime environments
→ runtime selection through extraOptions.preset
```

For most projects, starting with:

```typescript
createTestFramework({
  preset: recommendedPresets.default,
});
```

is enough.

Larger applications can then compose an application-specific preset with their own routes, localization, state policy, enabled plugin set, and other runtime configuration.

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
- **Safe overrides** — configuration follows an explicit hierarchy from preset defaults to individual test configuration.
- **Composable presets** — existing runtime environments can be extended instead of copied.
- **Plugin-owned integration knowledge** — reusable library-specific integration knowledge stays inside the corresponding plugin packages.
- **Project-owned configuration** — applications can materialize their chosen testing configuration directly in editable project source.
- **Vue Test Utils compatibility** — existing VTU configuration can be adopted incrementally.
- **Type safety** — component and plugin configuration remains strongly typed.
- **Isolated configuration** — plugin options factories produce fresh options for independent pipeline contexts, while component factory invocations create independent runtime environments.

---

<a id="documentation"></a>

# Documentation

TestForge documentation is organized into several focused guides.

## Getting Started

- [Getting Started](docs/getting-started.md)
- [Configuration & Advanced Usage](docs/configuration.md)

## Extending TestForge

- [Plugin Authoring Guide](docs/plugin-authoring-guide.md) — Create custom TestForge plugins
- [Preset Authoring Guide](docs/preset-authoring-guide.md) — Create project, organization, or shared runtime presets

## Package Documentation

- [@testforgejs/vue-test-core](packages/vue-test-core/README.md)
- [@testforgejs/vue-test-preset-base](packages/vue-test-preset-base/README.md)
- [@testforgejs/vue-test-preset-recommended](packages/vue-test-preset-recommended/README.md)
- [@testforgejs/vue-test-preset-recommended-jest](packages/vue-test-preset-recommended-jest/README.md)

---

<a id="multiple-test-environments"></a>

# Multiple Test Environments

Many projects need only one TestForge runtime environment:

```typescript
const { testComponentFactory } = createTestFramework({
  preset: projectPreset,
});
```

Larger projects may eventually need several distinct environments.

Examples include:

- application components using the full application stack;
- isolated UI components that do not need application state or routing;
- design-system components using PrimeVue or Vuetify;
- admin modules with additional plugins;
- package-level tests inside a monorepo.

TestForge supports two levels of separation.

## Multiple Presets in One Framework

When the environments belong to the same testing runtime, register multiple named presets:

```typescript
import { createTestFramework } from "@testforgejs/vue-test-core";

const { testComponentFactory } = createTestFramework({
  presets: {
    default: appPreset,
    designSystem: designSystemPreset,
  },
});
```

The normal invocation uses the `default` profile:

```typescript
const factory = testComponentFactory(MyComponent);

const wrapper = factory();
```

Another registered environment can be selected for an individual invocation:

```typescript
const wrapper = factory(
  {},
  {},
  {},
  {
    preset: "designSystem",
  },
);
```

Each named preset represents a complete managed-plugin runtime profile.

Selecting another preset is not an overlay on `default`.

Conceptually:

```text
createTestFramework({ presets })
→ registers multiple runtime profiles

extraOptions.preset
→ selects one profile for an invocation
```

## Multiple Framework Instances

Some projects need stronger architectural separation.

For example, a monorepo may have an application test environment and an independent design-system environment with unrelated plugin graphs.

In that case, create separate TestForge framework instances:

```typescript
// tests/app.ts

import { createTestFramework } from "@testforgejs/vue-test-core";
import { appPreset } from "./presets/app";

export const { testComponentFactory: appFactory } = createTestFramework({
  preset: appPreset,
});
```

```typescript
// tests/design-system.ts

import { createTestFramework } from "@testforgejs/vue-test-core";
import { designSystemPreset } from "./presets/design-system";

export const { testComponentFactory: dsFactory } = createTestFramework({
  preset: designSystemPreset,
});
```

Tests simply import the factory that matches their environment:

```typescript
import { appFactory } from "@/tests/app";

const factory = appFactory(MyComponent);
```

or:

```typescript
import { dsFactory } from "@/tests/design-system";

const factory = dsFactory(Button);
```

Each framework instance owns its own runtime configuration and mounting pipeline.

The distinction is:

```text
multiple presets
→ multiple runtime profiles inside one TestForge framework

multiple createTestFramework() calls
→ multiple independent TestForge frameworks
```

> [!TIP]
>
> Most projects need only one framework instance and one project preset.
>
> Named preset registries become useful when runtime switching is intentional. Multiple framework instances are primarily useful for stronger architectural separation such as monorepos, shared UI libraries, or substantially different testing stacks.

---

<a id="context-aware-overrides"></a>

# The Idea: Context-Aware Overrides

TestForge introduces one simple shift in perspective:

> Separate the environment baseline from the specific test delta.

You define the infrastructure baseline **once** in a preset and reusable component factory.

Individual tests then provide only the configuration they need to change.

Managed plugin configuration is expressed through TestForge's `plugins` API rather than repeatedly rebuilding Vue Test Utils `global.plugins`.

Different configuration layers have explicit semantics:

```text
preset defaults
→ runtime baseline

mountOptions.plugins
→ replacement at the mount layer

extraOptions.plugins
→ targeted shallow overlay
```

This keeps test configuration focused on intent while the Mount Pipeline resolves the resulting runtime environment.

---

<a id="before-after"></a>

# Before / After Example

## ❌ Vue Test Utils way (Configuration Explosion)

Without a reusable environment, tests may repeatedly rebuild the same plugin setup just to adjust one detail:

```typescript
// Test 1: English locale
it("renders English greeting", () => {
  const wrapper = mount(MyComponent, {
    global: {
      plugins: [
        createI18n({
          legacy: false,
          locale: "en",
          messages,
        }),
        createTestingPinia({
          initialState: {
            user: {
              loggedIn: true,
            },
          },
        }),
        createRouter({
          history: createMemoryHistory(),
          routes,
        }),
      ],
    },
  });
});

// Test 2: French locale
it("renders French greeting", () => {
  const wrapper = mount(MyComponent, {
    global: {
      plugins: [
        createI18n({
          legacy: false,
          locale: "fr",
          messages,
        }),
        createTestingPinia({
          initialState: {
            user: {
              loggedIn: true,
            },
          },
        }),
        createRouter({
          history: createMemoryHistory(),
          routes,
        }),
      ],
    },
  });
});
```

Most of the configuration is identical.

Only one value changed.

## ✅ The TestForge Way (Clean Deltas)

The project preset provides the managed plugin baseline once:

```typescript
const factory = testComponentFactory(MyComponent);
```

The default test can use that environment directly:

```typescript
it("renders English greeting", () => {
  const wrapper = factory();
});
```

For a targeted adjustment that should preserve the already resolved I18n configuration, use `extraOptions.plugins`:

```typescript
it("renders French greeting", () => {
  const wrapper = factory(
    {},
    {},
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

The test now expresses only the relevant delta:

```text
locale
en → fr
```

Another test can adjust Pinia independently:

```typescript
it("executes store actions", () => {
  const wrapper = factory(
    {},
    {},
    {},
    {
      plugins: {
        pinia: {
          stubActions: false,
        },
      },
    },
  );
});
```

The distinction between the two local configuration mechanisms is important:

- `mountOptions.plugins` **replaces** the corresponding managed plugin configuration at the mount layer.
- `extraOptions.plugins` applies a **shallow overlay** to the already resolved managed plugin configuration.

Use replacement when the test intends to provide a complete plugin configuration.

Use an overlay when the test needs to change only selected options.

---

<a id="core-concepts"></a>

# Core Concepts

TestForge is built around a few ideas that work together.

Individually they are simple. Together they remove most test setup noise.

> [!NOTE]
> Examples in this section focus on TestForge concepts rather than package installation.
>
> Any project or package that directly imports a TestForge plugin package must declare that plugin package as a direct dependency.
>
> See the [Getting Started Guide](./docs/getting-started.md) for project installation and initial setup.

---

<a id="test-component-factory"></a>

## Test Component Factory

The **Test Component Factory** is the entry point used by component tests.

Instead of repeatedly calling `mount()` with a large configuration object, create a reusable component factory:

```typescript
const factory = testComponentFactory(MyComponent);
```

Then invoke it in tests:

```typescript
factory({
  title: "Hello",
});
```

The component factory:

- accepts test-specific props;
- resolves the selected preset;
- resolves managed plugin configuration;
- builds Vue Test Utils `global` configuration;
- chooses `mount()` or `shallowMount()`;
- runs the **Mount Pipeline**.

The test describes what it needs rather than how to assemble the complete Vue runtime.

### Component Factory Invocations

A component factory can be invoked multiple times:

```typescript
const factory = testComponentFactory(MyComponent);

const first = factory();
const second = factory();
```

Each invocation creates its own runtime environment.

Mutable plugin runtime state should not be shared between independent invocations unless the test explicitly requests shared behavior through the supported plugin or Vue Test Utils mechanisms.

This is **component factory invocation isolation**.

It is separate from plugin options factory isolation.

---

<a id="plugin-system"></a>

## Plugin System

TestForge treats i18n, Pinia, Router, and other integrations as **managed plugins**.

A TestForge plugin is more than the Vue plugin itself.

It is a **test-environment integration** that participates in the TestForge runtime.

A plugin:

- has a stable name;
- defines its integration behavior;
- defines how its runtime plugin instance is created or installed;
- participates in the **Mount Pipeline**;
- can validate and resolve plugin-specific configuration;
- may expose a reusable project-independent baseline through `getDefaultOptions()`.

Examples provided by TestForge include:

- `@testforgejs/vue-test-plugin-pinia`;
- `@testforgejs/vue-test-plugin-i18n`;
- `@testforgejs/vue-test-plugin-router`;
- `@testforgejs/vue-test-plugin-vuetify`;
- `@testforgejs/vue-test-plugin-primevue`.

Because plugin behavior is encapsulated, TestForge can:

- validate plugin options;
- control activation;
- resolve plugin configuration;
- create isolated runtime instances;
- allow explicit overrides without rebuilding the entire environment.

### Plugin-Owned Defaults

A plugin may expose a reusable project-independent baseline:

```typescript
piniaPlugin.getDefaultOptions();
i18nPlugin.getDefaultOptions();
routerPlugin.getDefaultOptions();
```

These defaults belong to the plugin because the plugin understands the integrated library.

They are **not automatically applied**.

TestForge-maintained reusable preset packages can explicitly consume them when they intentionally want to follow the integration baseline provided by the installed plugin version.

For example, the TestForge base preset can use:

```typescript
import {
  i18nPlugin,
  PLUGIN_NAME as I18N_PLUGIN_NAME,
} from "@testforgejs/vue-test-plugin-i18n";

defaults: {
  [I18N_PLUGIN_NAME]: i18nPlugin.getDefaultOptions(),
}
```

A project-owned preset normally materializes the corresponding configuration instead:

```typescript
defaults: {
  [I18N_PLUGIN_NAME]: () => ({
    legacy: false,
    globalInjection: true,
  }),
}
```

Conceptually:

```text
plugin
→ owns reusable integration knowledge
→ may expose getDefaultOptions()

TestForge-maintained preset
→ may consume getDefaultOptions()
→ intentionally follows the plugin baseline

project-owned preset
→ materializes concrete configuration
→ owns that configuration
```

The distinction provides two useful stability models.

Official TestForge presets can evolve together with plugin integrations, while project-owned presets remain unchanged until the project edits them.

---

<a id="presets"></a>

## Presets

A preset is a declarative description of a TestForge managed-plugin runtime environment.

It defines:

- which managed plugins are available;
- which plugins are enabled by default;
- which baseline plugin configuration factories are selected.

For example, a project-owned Vitest preset can define its managed integrations explicitly:

```typescript
import { vi } from "vitest";
import { createMemoryHistory } from "vue-router";
import type { PresetDefinition } from "@testforgejs/vue-test-core";
import { piniaPlugin, PLUGIN_NAME as PINIA_PLUGIN_NAME } from "@testforgejs/vue-test-plugin-pinia";
import { i18nPlugin, PLUGIN_NAME as I18N_PLUGIN_NAME } from "@testforgejs/vue-test-plugin-i18n";
import {
  routerPlugin,
  PLUGIN_NAME as ROUTER_PLUGIN_NAME,
} from "@testforgejs/vue-test-plugin-router";

const preset = {
  manifest: [
    { module: piniaPlugin, enabled: true },
    { module: i18nPlugin, enabled: true },
    { module: routerPlugin, enabled: false },
  ],

  defaults: {
    [PINIA_PLUGIN_NAME]: () => ({
      createSpy: vi.fn,
    }),

    [I18N_PLUGIN_NAME]: () => ({
      legacy: false,
      globalInjection: true,
    }),

    [ROUTER_PLUGIN_NAME]: () => ({
      history: createMemoryHistory(),
      routes: [],
    }),
  },
} satisfies PresetDefinition;
```

Preset definitions use the standardized `PLUGIN_NAME` exports as their configuration keys.

This keeps each plugin's exported identifier as the single source of truth instead of repeating plugin name literals in preset definitions.

At the same time, the project owns the concrete values returned by its factories.

The two sections have separate responsibilities:

```text
manifest
→ plugin capability boundary
→ default enablement

defaults
→ baseline plugin configuration
```

A plugin can therefore have configuration available while remaining disabled:

```typescript
manifest: [
  {
    module: routerPlugin,
    enabled: false,
  },
],

defaults: {
  [ROUTER_PLUGIN_NAME]: () => ({
    history: createMemoryHistory(),
    routes: [],
  }),
},
```

Similarly, declaring a plugin does not automatically provide configuration for it.

```text
manifest inclusion ≠ default configuration
```

### Plugin Options Factories

Preset defaults are **plugin options factories**, not shared configuration objects.

For example:

```typescript
const routerDefaults = () => ({
  history: createMemoryHistory(),
  routes: [],
});

const first = routerDefaults();
const second = routerDefaults();

first !== second; // true
first.history !== second.history; // true
```

TestForge resolves these factories for the current pipeline context.

Factories can create fresh nested runtime values, such as independent Router history instances.

This prevents mutable configuration or runtime state from being unintentionally shared.

### Configuring a Preset

A framework can be configured with either a single preset or a registry of named presets.

For the common single-environment case:

```typescript
import { presets } from "@testforgejs/vue-test-preset-recommended";

createTestFramework({
  preset: presets.default,
});
```

The framework treats that preset as `default`.

For multiple named environments:

```typescript
createTestFramework({
  presets: {
    default: defaultPreset,
    admin: adminPreset,
  },
});
```

The two forms are mutually exclusive.

The criterion is the number of runtime environments the framework needs — not where the preset came from.

Even when a package exports a registry:

```typescript
import { presets } from "@testforgejs/vue-test-preset-recommended";
```

a project that needs only the standard environment should normally use:

```typescript
createTestFramework({
  preset: presets.default,
});
```

Register the complete registry only when the project actually wants multiple named profiles:

```typescript
createTestFramework({
  presets,
});
```

Those profiles can then be selected per component factory invocation:

```typescript
factory(
  {},
  {},
  {},
  {
    preset: "routerPreset",
  },
);
```

### Preset Composition

TestForge's official preset packages are organized in layers:

```text
plugin packages
      │
      │ reusable integration baselines
      ▼
@testforgejs/vue-test-preset-base
      │
      │ runner-independent composition
      │
      ├────────────────────┐
      ▼                    ▼
@testforgejs/          @testforgejs/
vue-test-preset-       vue-test-preset-
recommended            recommended-jest
      │                    │
      ▼                    ▼
    Vitest                 Jest
```

The base preset package:

- composes runner-independent managed plugins;
- chooses their default enabled state;
- explicitly consumes project-independent defaults exposed by plugin packages.

Runner-specific recommended presets reuse that composition and provide runner context only where required.

For example, the Vitest preset asks the Pinia plugin for runner-aware defaults:

```typescript
piniaPlugin.getDefaultOptions(vi);
```

The Jest preset does the same with Jest:

```typescript
piniaPlugin.getDefaultOptions(jest);
```

The responsibility boundary is:

```text
recommended preset
→ knows which runner is used

Pinia plugin
→ knows how that runner maps to Pinia testing configuration
```

The recommended preset does not need to reproduce Pinia integration knowledge manually.

This use of `getDefaultOptions()` is intentional because these presets are maintained together with the TestForge plugins whose baselines they consume.

### Project-Specific Presets

Official base and recommended presets are intended as **starting points**.

A larger application will often define its own preset.

For example, a project can reuse the recommended preset composition while taking ownership of its Pinia configuration:

```typescript
import { vi } from "vitest";
import { extendPreset } from "@testforgejs/vue-test-core";
import { PLUGIN_NAME as PINIA_PLUGIN_NAME } from "@testforgejs/vue-test-plugin-pinia";
import { presets as recommendedPresets } from "@testforgejs/vue-test-preset-recommended";

const projectPreset = extendPreset(recommendedPresets.default, {
  defaults: {
    [PINIA_PLUGIN_NAME]: () => ({
      createSpy: vi.fn,
      stubActions: false,
    }),
  },
});
```

The project has materialized the Pinia configuration it wants to preserve:

```text
createSpy: vi.fn
→ explicit Vitest integration configuration

stubActions: false
→ application testing policy
```

A project preset is the natural place for:

- explicit managed-plugin configuration;
- application routes;
- locales and translation messages;
- Pinia state or action policy;
- project-specific plugin enablement;
- themes;
- application-specific managed plugins;
- other runtime policy.

Then configure TestForge with that environment:

```typescript
createTestFramework({
  preset: projectPreset,
});
```

If a project extends an official preset without replacing one of its plugin factories, that configuration continues to come from the source preset.

For example:

```text
inherited factory
→ continues following source preset behavior

explicit replacement factory
→ project owns that configuration
```

Projects that need a plugin configuration to remain visible and stable in their own source should replace the inherited factory with an explicit project-owned factory.

This keeps the architecture layered:

```text
plugin
→ reusable integration knowledge

base preset
→ consumes runner-independent plugin defaults
→ reusable composition

recommended preset
→ consumes runner-aware plugin defaults
→ runner adaptation

project-owned preset
→ materializes concrete configuration
→ owns application-specific policy
```

### Official Preset Packages

TestForge provides:

- `@testforgejs/vue-test-preset-base` — runner-independent baseline presets;
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
3. resolves plugin activation;
4. resolves plugin options factories;
5. applies configuration layers according to their defined replacement and merge strategies;
6. creates or installs managed plugin runtimes;
7. builds the final Vue Test Utils configuration;
8. produces the options for `mount()` or `shallowMount()`.

Because this logic is centralized:

- configuration resolution is predictable;
- overrides behave consistently;
- plugin lifecycle behavior is reusable;
- edge cases are tested once in TestForge rather than independently in every project.

---

<a id="default-vs-override-philosophy"></a>

## Default vs Override Philosophy

TestForge follows a simple rule:

> The selected preset should provide a useful baseline for most tests. Local deviations should be explicit and predictable.

This is different from saying that every plugin-provided default must represent the ideal application behavior.

The layers have different ownership:

```text
plugin defaults
→ reusable project-independent integration baseline

official TestForge preset defaults
→ selected reusable runtime baseline
→ may intentionally follow plugin defaults

project-owned preset defaults
→ materialized project configuration
→ application policy

local configuration
→ individual scenario delta
```

This means:

- plugins should avoid unnecessary application policy;
- TestForge-maintained presets can explicitly consume plugin-owned baselines;
- project-owned presets should make the concrete configuration they own visible;
- local configuration changes only what a particular test requires;
- replacement and overlay semantics remain explicit.

You don't need to rebuild the runtime for every test.

You describe the relevant configuration delta, and TestForge resolves it through the Mount Pipeline.

---

<a id="incremental-migration"></a>

# Incremental Migration from Vue Test Utils

TestForge is designed as an **architecture extension** rather than a destructive replacement.

It preserves standard Vue Test Utils configuration patterns where possible while adding TestForge-specific preset and managed-plugin behavior.

An existing test suite can migrate incrementally.

---

## Stage 1: Minimal-Change Integration

In the first stage, keep most existing Vue Test Utils mount configuration.

If a VTU test looks like this:

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

Once tests run safely through TestForge, repeated infrastructure can be extracted incrementally.

Move shared component-specific configuration into the component factory:

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

For broadly shared managed-plugin infrastructure, move the baseline into a project preset.

A project-owned preset can make that baseline explicit in project source, while component-specific configuration remains in the appropriate component factory layer.

The migration path is therefore gradual:

```text
existing VTU mount configuration
→ TestForge component factory
→ shared component defaults
→ explicit project preset where appropriate
→ small per-test deltas
```

By transitioning incrementally, tests can shrink from infrastructure-heavy mount calls to concise declarative component factory invocations.

> [!NOTE]
>
> TestForge intentionally maintains compatibility with Vue Test Utils behavior and types where the corresponding configuration is part of the standard VTU API.

---

<a id="principles"></a>

# Principles

## Behavior parity with Vue Test Utils

TestForge intentionally preserves Vue Test Utils behavior and typing semantics where possible to simplify migration.

Existing VTU configurations can be adopted incrementally.

## Plugin-first architecture

Plugins are first-class TestForge integrations.

They own reusable library-specific runtime knowledge and may expose project-independent integration baselines.

Presets compose those plugins into runtime environments.

Conceptually:

```text
plugin
→ reusable integration knowledge

preset
→ runtime composition and configuration ownership
```

The concrete ownership model depends on the preset:

```text
TestForge-maintained preset
→ may consume plugin-owned defaults

project-owned preset
→ normally materializes concrete configuration
```

## Preset-driven environments

Presets define complete managed-plugin runtime environments rather than partial configuration overlays.

The active preset determines:

- the managed plugin capability boundary;
- default plugin enablement;
- selected plugin configuration factories.

Selecting another preset changes the complete managed-plugin runtime profile for that invocation.

## Explicit Plugin Defaults

Plugin-provided defaults are opt-in.

A plugin appearing in a manifest does not automatically activate its `getDefaultOptions()` configuration.

```text
manifest inclusion ≠ default configuration
```

TestForge-maintained preset packages explicitly call `getDefaultOptions()` when they intentionally want to follow a plugin's reusable integration baseline.

Because that dependency is explicit, updating a plugin can intentionally change the effective configuration of those official presets when the plugin baseline changes.

Project-owned presets use a different stability model.

When a project materializes its configuration:

```typescript
defaults: {
  [PINIA_PLUGIN_NAME]: () => ({
    createSpy: vi.fn,
  }),
}
```

that configuration remains unchanged until the project edits it.

Conceptually:

```text
official reusable preset
→ explicitly follows getDefaultOptions()
→ may follow plugin baseline changes

project-owned preset
→ materializes configuration
→ changes when the project changes it
```

## Plugin Options Factories

Preset `defaults` stores **plugin options factories**, not shared plugin configuration objects.

A plugin options factory is invoked for a pipeline context and produces fresh plugin options for that context.

For example:

```typescript
[ROUTER_PLUGIN_NAME]: () => ({
  history: createMemoryHistory(),
  routes: [],
})
```

creates a new Router history instance whenever that factory is resolved.

This is **plugin options factory isolation**.

It should not be confused with component factory invocation isolation.

## Component Factory Invocation Isolation

A **component factory** is created by `testComponentFactory(Component)` and can be invoked repeatedly to mount the component.

Each invocation creates an independent runtime environment.

This is **component factory invocation isolation**.

It is separate from the isolation provided by plugin options factories.

## Separation of Integration and Policy

Reusable TestForge layers should avoid mixing reusable library integration knowledge with application policy.

The intended separation is:

```text
plugin
→ reusable project-independent integration knowledge

base preset
→ consumes runner-independent plugin defaults
→ reusable composition

recommended preset
→ consumes runner-aware plugin defaults
→ test-runner adaptation

project-owned preset
→ materializes concrete integration configuration
→ owns application-specific policy

test
→ scenario-specific delta
```

Once configuration is materialized in a project-owned preset, it belongs to that project even if the values originated from the integration baseline currently used by an official TestForge preset.

This keeps each layer responsible only for information it can reasonably own.

## Strong typing

TypeScript types are inferred from components and plugins whenever possible.

Preset definitions and plugin configuration remain type-safe while still allowing composition.

## Opt-in abstractions

TestForge extends Vue Test Utils rather than replacing it.

Users can adopt additional TestForge abstractions only when they provide value.

A project can begin with a recommended preset and ordinary Vue Test Utils-style configuration, then introduce project-owned presets, managed plugins, named runtime profiles, and other abstractions incrementally.

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
