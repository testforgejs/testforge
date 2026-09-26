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
> Plugins own Vue ecosystem integration knowledge and may expose project-independent defaults. Presets compose those integrations into runtime environments, while runner-specific presets add behavior required by tools such as Vitest or Jest.

> [!NOTE]
>
> **TestForge architecture**
>
> - **Core** defines the runtime and Mount Pipeline.
> - **Plugins** define Vue ecosystem integrations and may expose project-independent defaults.
> - **Base presets** compose runner-independent plugin environments.
> - **Runner-specific recommended presets** add test-runner context where required.
> - **Project presets** add application-specific policy.
> - **The host application** provides Vue ecosystem dependencies.
>
> This separation keeps library-specific integration knowledge inside plugins while allowing presets to compose reusable testing environments without duplicating configuration.

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

For example, a minimal Pinia-only environment requires the Pinia integration:

```bash
pnpm add -D @testforgejs/vue-test-plugin-pinia
```

TestForge does not include plugin integrations in `@testforgejs/vue-test-core`. Each managed Vue ecosystem integration is provided by its own package.

```typescript
// tests/setup.ts

import { createTestFramework, type PresetDefinition } from "@testforgejs/vue-test-core";

import { piniaPlugin } from "@testforgejs/vue-test-plugin-pinia";
import { vi } from "vitest";

const preset = {
  manifest: [
    {
      module: piniaPlugin,
      enabled: true,
    },
  ],

  defaults: {
    pinia: piniaPlugin.getDefaultOptions(vi),
  },
} satisfies PresetDefinition;

const { testComponentFactory } = createTestFramework({
  preset,
});

export { testComponentFactory };
```

Here the Pinia plugin owns the runner-aware integration baseline:

```typescript
piniaPlugin.getDefaultOptions(vi);
```

The preset explicitly chooses that baseline.

Application-specific Pinia policy can be added separately when required.

For example, if a project wants real actions to execute instead of using the upstream testing behavior:

```typescript
const piniaDefaults = piniaPlugin.getDefaultOptions(vi);

const preset = {
  manifest: [
    {
      module: piniaPlugin,
      enabled: true,
    },
  ],

  defaults: {
    pinia: () => ({
      ...piniaDefaults(),
      stubActions: false,
    }),
  },
} satisfies PresetDefinition;
```

This keeps two responsibilities separate:

```text
plugin
→ Pinia integration baseline

project preset
→ project-specific action policy
```

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
- **Plugin-owned integration defaults** — library-specific integration knowledge stays inside the corresponding plugin packages.
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
- may expose a project-independent baseline through `getDefaultOptions()`.

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

A plugin may expose project-independent defaults:

```typescript
piniaPlugin.getDefaultOptions();
i18nPlugin.getDefaultOptions();
routerPlugin.getDefaultOptions();
```

These defaults belong to the plugin because the plugin understands the integrated library.

They are **not automatically applied**.

A preset explicitly chooses whether to use them:

```typescript
defaults: {
  i18n: i18nPlugin.getDefaultOptions(),
}
```

Conceptually:

```text
plugin
→ owns integration knowledge

preset
→ decides whether to select that integration baseline
```

This keeps plugin behavior reusable while preventing future plugin-default changes from silently modifying presets that did not opt into them.

---

<a id="presets"></a>

## Presets

A preset is a declarative description of a TestForge managed-plugin runtime environment.

It defines:

- which managed plugins are available;
- which plugins are enabled by default;
- which baseline plugin configuration factories are selected.

For example:

```typescript
import type { PresetDefinition } from "@testforgejs/vue-test-core";

import { piniaPlugin } from "@testforgejs/vue-test-plugin-pinia";
import { i18nPlugin } from "@testforgejs/vue-test-plugin-i18n";
import { routerPlugin } from "@testforgejs/vue-test-plugin-router";

const preset = {
  manifest: [
    { module: piniaPlugin, enabled: true },
    { module: i18nPlugin, enabled: true },
    { module: routerPlugin, enabled: false },
  ],

  defaults: {
    pinia: piniaPlugin.getDefaultOptions(),
    i18n: i18nPlugin.getDefaultOptions(),
    router: routerPlugin.getDefaultOptions(),
  },
} satisfies PresetDefinition;
```

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
  router: routerPlugin.getDefaultOptions(),
},
```

Similarly, declaring a plugin does not automatically apply its defaults.

```text
manifest inclusion ≠ default configuration
```

Plugin-provided defaults are opt-in.

### Plugin Options Factories

Preset defaults are **plugin options factories**, not shared configuration objects.

For example:

```typescript
const routerDefaults = routerPlugin.getDefaultOptions();

const first = routerDefaults();
const second = routerDefaults();

first !== second; // true
```

TestForge resolves these factories for the current pipeline context.

Factories can also create fresh nested runtime values.

For example, Router defaults can create independent history instances for separate contexts.

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
      │ project-independent integration baselines
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
- explicitly selects project-independent defaults exposed by plugin packages.

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

### Project-Specific Presets

Official base and recommended presets are intended as **starting points**.

A larger application will often define its own preset:

```typescript
import { extendPreset } from "@testforgejs/vue-test-core";
import { presets as recommendedPresets } from "@testforgejs/vue-test-preset-recommended";

const projectPreset = extendPreset(recommendedPresets.default, {
  // application-specific configuration
});
```

A project preset is the natural place for:

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

This keeps the architecture layered:

```text
plugin defaults
→ library integration baseline

base preset
→ runner-independent composition

recommended preset
→ runner adaptation

project preset
→ application policy
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

Plugin defaults and preset defaults operate at different levels:

```text
plugin defaults
→ minimal project-independent integration baseline

preset defaults
→ selected runtime baseline

project preset
→ application policy

local configuration
→ individual scenario delta
```

This means:

- plugins should avoid unnecessary application policy;
- presets explicitly select or replace plugin configuration;
- project presets provide application-specific behavior;
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

For component-specific managed-plugin configuration, use the appropriate component factory configuration layer.

The migration path is therefore gradual:

```text
existing VTU mount configuration
→ TestForge component factory
→ shared component defaults
→ project preset where appropriate
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

They own library-specific runtime knowledge and may expose project-independent configuration baselines.

Presets compose those plugins into runtime environments.

Conceptually:

```text
plugin
→ integration knowledge

preset
→ runtime composition
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

This keeps preset behavior explicit and protects existing presets from silently changing when a plugin evolves.

## Plugin Options Factories

Preset `defaults` stores **plugin options factories**, not shared plugin configuration objects.

A plugin options factory is invoked for a pipeline context and produces fresh plugin options for that context.

This is **plugin options factory isolation**.

It should not be confused with component factory invocation isolation.

## Component Factory Invocation Isolation

A **component factory** is created by `testComponentFactory(Component)` and can be invoked repeatedly to mount the component.

Each invocation creates an independent runtime environment.

This is **component factory invocation isolation**.

It is separate from the isolation provided by plugin options factories.

## Separation of Integration and Policy

Reusable TestForge layers should avoid mixing library integration with application policy.

The intended separation is:

```text
plugin
→ project-independent library integration

base preset
→ reusable runner-independent composition

recommended preset
→ test-runner adaptation

project preset
→ application-specific policy

test
→ scenario-specific delta
```

This keeps each layer responsible only for information it can reasonably own.

## Strong typing

TypeScript types are inferred from components and plugins whenever possible.

Preset definitions and plugin configuration remain type-safe while still allowing composition.

## Opt-in abstractions

TestForge extends Vue Test Utils rather than replacing it.

Users can adopt additional TestForge abstractions only when they provide value.

A project can begin with a recommended preset and ordinary Vue Test Utils-style configuration, then introduce project presets, managed plugins, named runtime profiles, and other abstractions incrementally.

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
