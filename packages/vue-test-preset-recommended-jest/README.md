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
→ owns the project-independent integration baseline

base preset
→ composes plugins without choosing a test runner

recommended-jest preset
→ adds Jest-specific runner integration

project preset
→ adds application-specific behavior
```

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

Projects that need actual routes or another history implementation should provide them explicitly in a project preset.

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

It also keeps knowledge about how Jest integrates with Pinia inside the Pinia plugin rather than duplicating that configuration in the preset package.

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

The `PLUGIN_NAME` export identifies the plugin consistently across its module and preset configuration, while `getDefaultOptions()` provides the configuration factory selected by the preset.

This keeps both the target plugin and the source of its configuration explicit and prevents plugin defaults from changing existing presets implicitly.

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

Application-specific behavior should normally be added in a project preset rather than in TestForge plugin defaults.

### Customizing Pinia

For example, a project may want real Pinia actions to execute instead of using the upstream testing default that stubs them.

Use the Pinia plugin's runner-aware defaults as the baseline:

```typescript
import { jest } from "@jest/globals";

import { extendPreset } from "@testforgejs/vue-test-core";
import { piniaPlugin, PLUGIN_NAME as PINIA_PLUGIN_NAME } from "@testforgejs/vue-test-plugin-pinia";
import { presets as recommendedPresets } from "@testforgejs/vue-test-preset-recommended-jest";

const piniaDefaults = piniaPlugin.getDefaultOptions(jest);

const projectPreset = extendPreset(recommendedPresets.default, {
  defaults: {
    [PINIA_PLUGIN_NAME]: () => ({
      ...piniaDefaults(),
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

The runner integration remains owned by the Pinia plugin, while `stubActions: false` is explicit project policy.

A project using this single runtime environment can pass it directly to TestForge:

```typescript
const { testComponentFactory } = createTestFramework({
  preset: projectPreset,
});
```

### Customizing Vue I18n

Application locale and translation messages should be configured explicitly:

```typescript
import { extendPreset } from "@testforgejs/vue-test-core";
import { i18nPlugin, PLUGIN_NAME as I18N_PLUGIN_NAME } from "@testforgejs/vue-test-plugin-i18n";
import { presets as recommendedPresets } from "@testforgejs/vue-test-preset-recommended-jest";

const i18nDefaults = i18nPlugin.getDefaultOptions();

const projectPreset = extendPreset(recommendedPresets.default, {
  defaults: {
    [I18N_PLUGIN_NAME]: () => ({
      ...i18nDefaults(),
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

Use it directly when no runtime preset switching is needed:

```typescript
const { testComponentFactory } = createTestFramework({
  preset: projectPreset,
});
```

### Customizing Vue Router

Application routes should also be configured explicitly:

```typescript
import { extendPreset } from "@testforgejs/vue-test-core";
import {
  routerPlugin,
  PLUGIN_NAME as ROUTER_PLUGIN_NAME,
} from "@testforgejs/vue-test-plugin-router";
import { presets as recommendedPresets } from "@testforgejs/vue-test-preset-recommended-jest";

const routerDefaults = routerPlugin.getDefaultOptions();

const projectPreset = extendPreset(recommendedPresets.default, {
  defaults: {
    [ROUTER_PLUGIN_NAME]: () => ({
      ...routerDefaults(),
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

The plugin-provided in-memory history is preserved here.

If the application requires another history implementation, override it explicitly:

```typescript
import { createWebHistory } from "vue-router";

const projectPreset = extendPreset(recommendedPresets.default, {
  defaults: {
    [ROUTER_PLUGIN_NAME]: () => ({
      ...routerDefaults(),
      history: createWebHistory(),
      routes,
    }),
  },
});
```

## Replacing Preset Defaults

When an extension provides a plugin options factory, that factory replaces the corresponding factory from the base preset.

For example:

```typescript
extendPreset(recommendedPresets.default, {
  defaults: {
    [PINIA_PLUGIN_NAME]: () => ({
      stubActions: false,
      createSpy: jest.fn,
    }),
  },
});
```

TestForge does not implicitly merge this factory with:

```typescript
piniaPlugin.getDefaultOptions(jest);
```

If existing plugin defaults should be preserved, compose them explicitly:

```typescript
const piniaDefaults = piniaPlugin.getDefaultOptions(jest);

extendPreset(recommendedPresets.default, {
  defaults: {
    [PINIA_PLUGIN_NAME]: () => ({
      ...piniaDefaults(),
      stubActions: false,
    }),
  },
});
```

This makes the plugin identifier, the baseline, and the project-specific additions visible.

## Plugin Options Factory Isolation

Preset `defaults` values are plugin options factories rather than shared configuration objects.

Preset definitions use the exported plugin identifier:

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

The selected preset provides the managed-plugin runtime baseline, while project presets and individual component tests can add or override configuration where needed.

## Related Packages

- [`@testforgejs/vue-test-core`](https://www.npmjs.com/package/@testforgejs/vue-test-core) — TestForge core framework
- [`@testforgejs/vue-test-preset-base`](https://www.npmjs.com/package/@testforgejs/vue-test-preset-base) — base runner-independent presets
- [`@testforgejs/vue-test-preset-recommended`](https://www.npmjs.com/package/@testforgejs/vue-test-preset-recommended) — recommended Vitest presets
- [`@testforgejs/vue-test-plugin-pinia`](https://www.npmjs.com/package/@testforgejs/vue-test-plugin-pinia) — Pinia integration
- [`@testforgejs/vue-test-plugin-i18n`](https://www.npmjs.com/package/@testforgejs/vue-test-plugin-i18n) — Vue I18n integration
- [`@testforgejs/vue-test-plugin-router`](https://www.npmjs.com/package/@testforgejs/vue-test-plugin-router) — Vue Router integration

## License

MIT
