# @testforgejs/vue-test-preset-recommended-jest

Recommended **Jest** presets for the [TestForge](https://github.com/testforgejs/testforge) Vue 3 component testing framework.

This package builds on [`@testforgejs/vue-test-preset-base`](https://www.npmjs.com/package/@testforgejs/vue-test-preset-base) and adds Jest-specific configuration where required.

The primary difference from the base presets is the Pinia configuration:

```typescript
piniaPlugin.getDefaultOptions(jest);
```

This allows the Pinia plugin to use Jest's `jest.fn` as the `createSpy` implementation required by `@pinia/testing` when an explicit runner is provided.

Vue I18n and Vue Router do not require Jest-specific configuration, so their presets are inherited directly from the base package.

Conceptually:

```text
plugin
→ owns reusable integration knowledge

base preset
→ consumes runner-independent plugin defaults
→ composes plugins without choosing a test runner

recommended-jest preset
→ consumes runner-aware plugin defaults
→ adds Jest-specific runner integration

project-owned preset
→ materializes concrete plugin configuration
→ owns application-specific policy
```

The distinction between the recommended Jest preset and a project-owned preset is intentional.

The TestForge-maintained recommended preset may use `getDefaultOptions()` because it deliberately follows the integration baseline exported by the installed plugin version.

A project-owned preset should normally materialize the concrete configuration it wants to preserve in its own source code.

## Installation

Choose your preferred package manager.

### pnpm

```bash
pnpm add -D @testforgejs/vue-test-preset-recommended-jest@beta
```

### npm

```bash
npm install -D @testforgejs/vue-test-preset-recommended-jest@beta
```

### Yarn

```bash
yarn add -D @testforgejs/vue-test-preset-recommended-jest@beta
```

> `@testforgejs/vue-test-core` and `@testforgejs/vue-test-preset-base` are required dependencies.

## Quick Usage

For a single runtime environment, pass the recommended default preset through `preset`:

```typescript
// tests/setup.ts

import { createTestFramework } from "@testforgejs/vue-test-core";
import { presets } from "@testforgejs/vue-test-preset-recommended-jest";

const { testComponentFactory } = createTestFramework({
  preset: presets.default,
});

export { testComponentFactory };
```

You can then use `testComponentFactory` in component tests:

```typescript
import { describe, expect, it } from "@jest/globals";

import { testComponentFactory } from "./setup";
import MyComponent from "./MyComponent.vue";

describe("MyComponent", () => {
  it("renders", () => {
    const factory = testComponentFactory(MyComponent);
    const wrapper = factory();

    expect(wrapper.exists()).toBe(true);
  });
});
```

## Single vs. Multiple Presets

`createTestFramework()` supports two mutually exclusive preset configuration forms.

Use `preset` when the framework needs a single runtime environment:

```typescript
const { testComponentFactory } = createTestFramework({
  preset: presets.default,
});
```

A single preset is treated as the framework's default runtime environment.

Use `presets` when the framework should expose multiple named runtime environments:

```typescript
const { testComponentFactory } = createTestFramework({
  presets,
});
```

The exported registry contains:

```text
default
piniaPreset
i18nPreset
routerPreset
```

Named presets registered through `presets` can be selected for individual component factory invocations through `extraOptions.preset`.

In general:

```text
preset
→ one runtime environment

presets
→ multiple named runtime environments
→ runtime selection through extraOptions.preset
```

## Available Presets

The package exports four presets:

- `presets.default`
- `presets.piniaPreset`
- `presets.i18nPreset`
- `presets.routerPreset`

They are built from the corresponding presets exported by `@testforgejs/vue-test-preset-base`.

The current composition is equivalent to:

```typescript
import { jest } from "@jest/globals";

import { extendPreset } from "@testforgejs/vue-test-core";
import { presets as basePresets } from "@testforgejs/vue-test-preset-base";
import { piniaPlugin, PLUGIN_NAME as PINIA_PLUGIN_NAME } from "@testforgejs/vue-test-plugin-pinia";

export const presets = {
  default: extendPreset(basePresets.default, {
    defaults: {
      [PINIA_PLUGIN_NAME]: piniaPlugin.getDefaultOptions(jest),
    },
  }),

  piniaPreset: extendPreset(basePresets.piniaPreset, {
    defaults: {
      [PINIA_PLUGIN_NAME]: piniaPlugin.getDefaultOptions(jest),
    },
  }),

  i18nPreset: basePresets.i18nPreset,
  routerPreset: basePresets.routerPreset,
};
```

Preset definitions use the standardized `PLUGIN_NAME` export as the configuration key instead of repeating plugin name literals.

This keeps the identifier exported by the plugin package as the single source of truth.

Because this package is a TestForge-maintained reusable preset, it intentionally obtains its runner-aware Pinia baseline through `getDefaultOptions(jest)`.

When only one of these environments is needed, use it directly through `createTestFramework({ preset })`.

### `presets.default`

The default recommended Jest preset contains:

- Pinia — enabled;
- Vue I18n — enabled;
- Vue Router — declared but disabled.

It inherits the plugin composition from `presets.default` in the base package.

The Pinia defaults are replaced with the runner-aware defaults provided by the Pinia plugin:

```typescript
piniaPlugin.getDefaultOptions(jest);
```

The resulting Pinia options are currently equivalent to:

```typescript
{
  createSpy: jest.fn,
}
```

TestForge does not override other `@pinia/testing` behavior.

In particular, actions follow the upstream `createTestingPinia()` behavior and are stubbed by default unless a project explicitly configures:

```typescript
stubActions: false;
```

Vue I18n and Vue Router continue to use the defaults selected by the base preset.

```typescript
const { testComponentFactory } = createTestFramework({
  preset: presets.default,
});
```

This is the general-purpose preset intended for Jest-based TestForge projects.

### `presets.piniaPreset`

A minimal preset containing only Pinia.

```typescript
const { testComponentFactory } = createTestFramework({
  preset: presets.piniaPreset,
});
```

The preset is based on `basePresets.piniaPreset`, but replaces its runner-neutral Pinia defaults with:

```typescript
piniaPlugin.getDefaultOptions(jest);
```

This provides the Jest spy implementation explicitly rather than relying on test-runner globals.

The current Pinia defaults are equivalent to:

```typescript
{
  createSpy: jest.fn,
}
```

Other Pinia testing behavior remains controlled by `@pinia/testing` unless the project overrides it.

### `presets.i18nPreset`

A minimal preset containing only Vue I18n.

```typescript
const { testComponentFactory } = createTestFramework({
  preset: presets.i18nPreset,
});
```

This preset is inherited directly from `@testforgejs/vue-test-preset-base` because Vue I18n does not require Jest-specific configuration.

The plugin defaults selected by the base preset are currently equivalent to:

```typescript
{
  legacy: false,
  globalInjection: true,
}
```

These options provide a project-independent Vue 3 integration baseline.

The preset intentionally does not choose:

- an application locale;
- a fallback locale;
- translation messages;
- formatting configuration;
- missing-translation or fallback warning policy.

Those settings belong in project-specific configuration.

### `presets.routerPreset`

A minimal preset containing only Vue Router.

```typescript
const { testComponentFactory } = createTestFramework({
  preset: presets.routerPreset,
});
```

This preset is inherited directly from `@testforgejs/vue-test-preset-base`.

The Router defaults selected by the base preset are currently equivalent to:

```typescript
{
  history: createMemoryHistory(),
  routes: [],
}
```

The in-memory history keeps routing isolated from browser URL state.

The empty route table ensures that TestForge does not invent application-specific routes.

Projects that need actual routes or another history implementation should provide them explicitly in a project-owned preset.

## Recommended Jest vs Base Presets

`@testforgejs/vue-test-preset-base` provides runner-independent preset definitions.

`@testforgejs/vue-test-preset-recommended-jest` adds Jest-specific configuration only where it is required.

```text
@testforgejs/vue-test-preset-base
       │
       ├── default
       │      └── Pinia defaults without a runner
       │
       ├── piniaPreset
       │      └── Pinia defaults without a runner
       │
       ├── i18nPreset
       │
       └── routerPreset
              │
              ▼
@testforgejs/vue-test-preset-recommended-jest
       │
       ├── default
       │      └── piniaPlugin.getDefaultOptions(jest)
       │
       ├── piniaPreset
       │      └── piniaPlugin.getDefaultOptions(jest)
       │
       ├── i18nPreset
       │      └── inherited unchanged
       │
       └── routerPreset
              └── inherited unchanged
```

This separation keeps runner knowledge out of the base preset.

It also keeps knowledge about how Jest integrates with Pinia inside the Pinia plugin rather than duplicating that configuration in the TestForge-maintained preset package.

In other words:

```text
recommended-jest preset
→ knows that the runner is Jest

Pinia plugin
→ knows how Jest runner support maps to Pinia configuration
```

## Plugin Defaults Are Explicit

Plugin defaults are not automatically applied simply because a plugin appears in a preset manifest.

For example:

```typescript
manifest: [
  {
    module: piniaPlugin,
    enabled: true,
  },
];
```

does not implicitly call:

```typescript
piniaPlugin.getDefaultOptions(jest);
```

The recommended Jest preset explicitly selects the runner-aware Pinia defaults using the identifier exported by the plugin package:

```typescript
defaults: {
  [PINIA_PLUGIN_NAME]: piniaPlugin.getDefaultOptions(jest),
}
```

The `PLUGIN_NAME` export identifies the plugin consistently across its module and preset configuration, while `getDefaultOptions()` provides the configuration factory selected by this TestForge-maintained preset.

Because the recommended Jest preset deliberately references `getDefaultOptions(jest)`, it intentionally follows the runner-aware integration baseline provided by the installed Pinia plugin version.

Project-owned presets that need their concrete configuration to remain visible and stable across plugin baseline changes should materialize that configuration explicitly instead.

## Switching Presets at Runtime

Use the preset registry when the same TestForge framework instance should expose multiple named runtime environments:

```typescript
import { createTestFramework } from "@testforgejs/vue-test-core";
import { presets } from "@testforgejs/vue-test-preset-recommended-jest";

const { testComponentFactory } = createTestFramework({
  presets,
});
```

A component factory invocation can then select another registered preset using the fourth `extraOptions` argument:

```typescript
const factory = testComponentFactory(MyComponent);

factory(
  {},
  {},
  {},
  {
    preset: "i18nPreset",
  },
);
```

The selected preset defines the complete managed-plugin runtime for that invocation.

For example:

```typescript
factory(
  {},
  {},
  {},
  {
    preset: "piniaPreset",
  },
);
```

selects the Pinia-only runtime environment.

This allows a single TestForge framework instance to expose several predefined runtime profiles.

The similarly named options operate at different levels:

```text
createTestFramework({ preset })
→ configures one framework-wide runtime environment

createTestFramework({ presets })
→ registers multiple named runtime environments

extraOptions.preset
→ selects one registered runtime environment for a factory invocation
```

Runtime selection through `extraOptions.preset` applies to named presets registered through `presets`.

## Customizing Presets

The recommended Jest presets are ordinary TestForge preset definitions and can be composed with `extendPreset()`.

Application-specific behavior should normally be added in a project-owned preset rather than in TestForge plugin defaults.

When a project replaces a plugin factory, it should normally materialize the concrete configuration it wants to own rather than call `getDefaultOptions()` again.

This keeps the project's effective test environment visible in source and prevents future changes to a plugin baseline from silently changing that materialized configuration.

### Customizing Pinia

For example, a project may want real Pinia actions to execute instead of using the upstream testing default that stubs them.

A project-owned preset can materialize both the required Jest integration and the project-specific action policy:

```typescript
import { jest } from "@jest/globals";
import { extendPreset } from "@testforgejs/vue-test-core";
import { PLUGIN_NAME as PINIA_PLUGIN_NAME } from "@testforgejs/vue-test-plugin-pinia";
import { presets as recommendedPresets } from "@testforgejs/vue-test-preset-recommended-jest";

const projectPreset = extendPreset(recommendedPresets.default, {
  defaults: {
    [PINIA_PLUGIN_NAME]: () => ({
      createSpy: jest.fn,
      stubActions: false,
    }),
  },
});
```

This produces:

```typescript
{
  createSpy: jest.fn,
  stubActions: false,
}
```

The recommended Jest preset obtains `createSpy: jest.fn` through the Pinia plugin's runner-aware defaults.

The project-owned preset materializes that value in its own source together with its `stubActions: false` policy.

Conceptually:

```text
recommended-jest preset
→ follows runner-aware plugin baseline

project-owned preset
→ materializes createSpy: jest.fn
→ adds stubActions: false
→ owns the resulting configuration
```

A project using this single runtime environment can pass it directly to TestForge:

```typescript
const { testComponentFactory } = createTestFramework({
  preset: projectPreset,
});
```

### Customizing Vue I18n

Application locale and translation messages should be configured explicitly.

A project-owned preset should also materialize the integration values it intends to preserve:

```typescript
import { extendPreset } from "@testforgejs/vue-test-core";
import { PLUGIN_NAME as I18N_PLUGIN_NAME } from "@testforgejs/vue-test-plugin-i18n";
import { presets as recommendedPresets } from "@testforgejs/vue-test-preset-recommended-jest";

const projectPreset = extendPreset(recommendedPresets.default, {
  defaults: {
    [I18N_PLUGIN_NAME]: () => ({
      legacy: false,
      globalInjection: true,

      locale: "en",
      messages: {
        en: {
          hello: "Hello",
        },
      },
    }),
  },
});
```

Here:

```text
legacy / globalInjection
→ materialized integration baseline

locale / messages
→ project-specific policy
```

All of these values are now visible and owned by the project preset.

Use it directly when no runtime preset switching is needed:

```typescript
const { testComponentFactory } = createTestFramework({
  preset: projectPreset,
});
```

### Customizing Vue Router

Application routes should also be configured explicitly.

The recommended default preset declares Router but keeps it disabled, so a project that wants Router as part of its default runtime should explicitly enable it and materialize its Router configuration:

```typescript
import { createMemoryHistory } from "vue-router";
import { extendPreset } from "@testforgejs/vue-test-core";
import {
  routerPlugin,
  PLUGIN_NAME as ROUTER_PLUGIN_NAME,
} from "@testforgejs/vue-test-plugin-router";
import { presets as recommendedPresets } from "@testforgejs/vue-test-preset-recommended-jest";

const projectPreset = extendPreset(recommendedPresets.default, {
  manifest: [
    {
      module: routerPlugin,
      enabled: true,
    },
  ],

  defaults: {
    [ROUTER_PLUGIN_NAME]: () => ({
      history: createMemoryHistory(),

      routes: [
        {
          path: "/",
          component: HomeView,
        },
      ],
    }),
  },
});
```

The project now owns both decisions:

```text
manifest
→ Router is enabled

defaults
→ createMemoryHistory()
→ application routes
```

The in-memory history is explicit project-owned configuration rather than an indirect dependency on `routerPlugin.getDefaultOptions()`.

If the application requires another history implementation, replace it directly:

```typescript
import { createWebHistory } from "vue-router";

const projectPreset = extendPreset(recommendedPresets.default, {
  manifest: [
    {
      module: routerPlugin,
      enabled: true,
    },
  ],

  defaults: {
    [ROUTER_PLUGIN_NAME]: () => ({
      history: createWebHistory(),
      routes,
    }),
  },
});
```

## Replacing Preset Defaults

When an extension provides a plugin options factory, that factory replaces the corresponding factory from the source preset.

For example:

```typescript
extendPreset(recommendedPresets.default, {
  defaults: {
    [PINIA_PLUGIN_NAME]: () => ({
      createSpy: jest.fn,
      stubActions: false,
    }),
  },
});
```

TestForge does not implicitly merge this factory with:

```typescript
piniaPlugin.getDefaultOptions(jest);
```

or with the factory already present in `recommendedPresets.default`.

For a project-owned preset, explicit replacement is normally preferable because the effective configuration is visible in project source:

```typescript
[PINIA_PLUGIN_NAME]: () => ({
  createSpy: jest.fn,
  stubActions: false,
})
```

A project can instead deliberately preserve and spread the source preset factory:

```typescript
const sourcePinia = recommendedPresets.default.defaults.pinia;

const projectPreset = extendPreset(recommendedPresets.default, {
  defaults: {
    [PINIA_PLUGIN_NAME]: () => ({
      ...sourcePinia(),
      stubActions: false,
    }),
  },
});
```

This has different semantics.

The project now intentionally continues to depend on the Pinia factory provided by `recommendedPresets.default`.

If that source factory changes after a dependency update, the effective project configuration can change as well.

Conceptually:

```text
spread source preset factory
→ continue following source preset behavior

explicit replacement factory
→ project owns the resulting configuration
```

For a stable project-owned preset, prefer explicit materialization:

```typescript
const projectPreset = extendPreset(recommendedPresets.default, {
  defaults: {
    [PINIA_PLUGIN_NAME]: () => ({
      createSpy: jest.fn,
      stubActions: false,
    }),
  },
});
```

## Plugin Options Factory Isolation

Preset `defaults` values are plugin options factories rather than shared configuration objects.

The recommended Jest preset stores its Pinia options factory under the exported plugin identifier:

```typescript
defaults: {
  [PINIA_PLUGIN_NAME]: piniaPlugin.getDefaultOptions(jest),
}
```

Because `PINIA_PLUGIN_NAME` resolves to `"pinia"`, the resolved preset can still be consumed through its normal property key.

Each invocation produces a fresh options object for the current pipeline context:

```typescript
const first = presets.default.defaults.pinia();
const second = presets.default.defaults.pinia();

first !== second; // true
```

Runner-independent presets preserve the same factory-based isolation.

For Router, the options factory also creates a fresh in-memory history instance for each invocation:

```typescript
const first = presets.routerPreset.defaults.router();
const second = presets.routerPreset.defaults.router();

first.history !== second.history; // true
```

This avoids unintentionally sharing mutable plugin configuration or runtime state between independent pipeline contexts.

A plugin options factory and a component factory operate at different levels:

```text
plugin options factory
→ creates plugin configuration

testComponentFactory()
→ creates a reusable component mounting factory

component factory invocation
→ creates an individual component test runtime
```

The `getDefaultOptions(jest)` example in this section describes the implementation of the TestForge-maintained recommended Jest preset.

A project-owned preset can preserve the same factory isolation while materializing its configuration explicitly:

```typescript
defaults: {
  [PINIA_PLUGIN_NAME]: () => ({
    createSpy: jest.fn,
  }),
}
```

## Using a Preset with Other Framework Configuration

When using a single runtime environment, combine it with other framework options through `preset`:

```typescript
const { testComponentFactory } = createTestFramework({
  preset: presets.default,
  shallowByDefault: true,
});
```

When multiple named environments are required, use the registry form instead:

```typescript
const { testComponentFactory } = createTestFramework({
  presets,
  shallowByDefault: true,
});
```

The selected preset provides the managed-plugin runtime baseline.

A project-owned preset can materialize and replace that configuration explicitly, while individual component tests can apply local overrides where needed.

## Related Packages

- [`@testforgejs/vue-test-core`](https://www.npmjs.com/package/@testforgejs/vue-test-core) — TestForge core framework
- [`@testforgejs/vue-test-preset-base`](https://www.npmjs.com/package/@testforgejs/vue-test-preset-base) — base runner-independent presets
- [`@testforgejs/vue-test-preset-recommended`](https://www.npmjs.com/package/@testforgejs/vue-test-preset-recommended) — recommended Vitest presets
- [`@testforgejs/vue-test-plugin-pinia`](https://www.npmjs.com/package/@testforgejs/vue-test-plugin-pinia) — Pinia integration
- [`@testforgejs/vue-test-plugin-i18n`](https://www.npmjs.com/package/@testforgejs/vue-test-plugin-i18n) — Vue I18n integration
- [`@testforgejs/vue-test-plugin-router`](https://www.npmjs.com/package/@testforgejs/vue-test-plugin-router) — Vue Router integration

## License

MIT
