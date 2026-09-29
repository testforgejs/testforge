# @testforgejs/vue-test-preset-base

Base presets for the [TestForge](https://github.com/testforgejs/testforge) Vue 3 component testing framework.

This package provides **runner-independent TestForge presets** built from the project-independent defaults exposed by TestForge plugin packages.

The base preset does not own plugin defaults. Instead, it explicitly opts into the defaults provided by each plugin through `getDefaultOptions()`.

This keeps responsibilities separated:

```text
plugin
→ owns the reusable project-independent integration baseline

base preset
→ composes plugins
→ consumes runner-independent plugin defaults

runner-specific TestForge preset
→ consumes runner-aware plugin defaults
→ adds test-runner-specific configuration

project-owned preset
→ materializes concrete plugin configuration
→ owns application-specific policy
```

The base presets intentionally contain no test-runner-specific configuration.

In particular, Pinia defaults are resolved without passing a runner to `getDefaultOptions()`.

## Installation

Choose your preferred package manager.

### pnpm

```bash
pnpm add -D @testforgejs/vue-test-preset-base@beta
```

### npm

```bash
npm install -D @testforgejs/vue-test-preset-base@beta
```

### Yarn

```bash
yarn add -D @testforgejs/vue-test-preset-base@beta
```

> `@testforgejs/vue-test-core` is required.

## Quick Usage

For a single runtime environment, pass the desired preset through `preset`:

```typescript
// tests/setup.ts

import { createTestFramework } from "@testforgejs/vue-test-core";
import { presets } from "@testforgejs/vue-test-preset-base";

const { testComponentFactory } = createTestFramework({
  preset: presets.default,
});

export { testComponentFactory };
```

You can then use `testComponentFactory` in component tests:

```typescript
import { describe, expect, it } from "vitest";

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

> The base presets are runner-independent. For integrations that benefit from explicit runner configuration, use a runner-specific preset such as `@testforgejs/vue-test-preset-recommended` or `@testforgejs/vue-test-preset-recommended-jest`.

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

The exported `presets` registry contains:

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

## Plugin Defaults

Plugin defaults are owned by the corresponding plugin packages.

For example:

```typescript
piniaPlugin.getDefaultOptions();
i18nPlugin.getDefaultOptions();
routerPlugin.getDefaultOptions();
```

return plugin options factories that provide each plugin's reusable project-independent integration baseline.

The base preset explicitly references these factories.

Each TestForge plugin package also exposes its plugin identifier through the standardized `PLUGIN_NAME` export.

The base preset uses these exported identifiers as its `defaults` keys:

```typescript
import { piniaPlugin, PLUGIN_NAME as PINIA_PLUGIN_NAME } from "@testforgejs/vue-test-plugin-pinia";
import { i18nPlugin, PLUGIN_NAME as I18N_PLUGIN_NAME } from "@testforgejs/vue-test-plugin-i18n";
import {
  routerPlugin,
  PLUGIN_NAME as ROUTER_PLUGIN_NAME,
} from "@testforgejs/vue-test-plugin-router";

const defaults = {
  [PINIA_PLUGIN_NAME]: piniaPlugin.getDefaultOptions(),
  [I18N_PLUGIN_NAME]: i18nPlugin.getDefaultOptions(),
  [ROUTER_PLUGIN_NAME]: routerPlugin.getDefaultOptions(),
};
```

This keeps the identifier exported by each plugin package as the single source of truth instead of repeating plugin name literals in preset definitions.

The same identifier is used by the plugin module itself and by the preset configuration that targets it.

Plugin defaults are **not applied automatically**.

Declaring a plugin in a manifest:

```typescript
manifest: [
  {
    module: routerPlugin,
    enabled: true,
  },
],
```

does not implicitly call:

```typescript
routerPlugin.getDefaultOptions();
```

The base preset explicitly decides which plugin-provided defaults it consumes.

In other words:

```text
manifest inclusion ≠ default configuration
```

`getDefaultOptions()` is particularly useful for TestForge-maintained reusable preset packages because those packages intentionally follow the integration baseline exported by the corresponding plugin version.

Project-owned presets have a different ownership model. Their concrete plugin configuration should normally be expressed explicitly in project source rather than delegated to `getDefaultOptions()`.

## Available Presets

The package exports four presets:

- `presets.default`
- `presets.piniaPreset`
- `presets.i18nPreset`
- `presets.routerPreset`

Each preset represents a complete managed-plugin runtime environment.

When only one of these environments is needed, use it directly through `createTestFramework({ preset })`.

### `presets.default`

The default base preset contains:

- Pinia — enabled;
- Vue I18n — enabled;
- Vue Router — declared but disabled.

The default enablement reflects both how these integrations are typically used and the role of the base preset as a convenient starting point for TestForge projects.

Vue I18n is enabled because localization is commonly a cross-cutting concern in applications that use it. Translation APIs and globally injected helpers may be used throughout the component tree, so providing the integration as part of the default runtime avoids repeated per-test setup.

Pinia is also enabled because the base preset is intended to provide a useful component-testing environment with minimal initial configuration. In applications that use Pinia, store access may be required directly by components or indirectly through composables and child components. Keeping the testing integration available allows those components to work without explicitly enabling Pinia for each test.

The Pinia integration remains intentionally lightweight: enabling it does not impose application-specific store state or action policy. Plugin defaults preserve the behavior of `@pinia/testing` unless the project configures it explicitly.

Vue Router is different. Routing context is usually required only by route-aware components such as views, navigation components, links, and layouts. Most components do not depend on routing, so the Router integration is declared by the preset but remains disabled until explicitly required.

Conceptually:

```text
Vue I18n
→ broadly shared UI infrastructure
→ enabled by default

Pinia
→ broadly useful application-state infrastructure
→ enabled by default

Vue Router
→ contextual navigation infrastructure
→ disabled by default
```

The base and recommended presets are intended as starting points rather than complete application-specific environments.

Larger applications can define project-specific presets that enable only the integrations they need and make their routes, localization, state behavior, integration configuration, and other application policy explicit.

```typescript
const { testComponentFactory } = createTestFramework({
  preset: presets.default,
});
```

#### Pinia

The base preset uses:

```typescript
piniaPlugin.getDefaultOptions();
```

without passing a test runner.

The resulting plugin defaults are currently equivalent to:

```typescript
{
}
```

This is intentional.

The Pinia plugin does not override `@pinia/testing` behavior when TestForge has no runner-specific configuration to provide.

As a result, behavior such as action stubbing and initial state follows `@pinia/testing` defaults.

When `createSpy` is not provided explicitly, `@pinia/testing` is responsible for resolving an appropriate spy implementation from the test environment.

Runner-specific TestForge presets avoid relying on this mechanism by passing their runner explicitly.

#### Vue I18n

The base preset uses:

```typescript
i18nPlugin.getDefaultOptions();
```

The current plugin defaults are equivalent to:

```typescript
{
  legacy: false,
  globalInjection: true,
}
```

These options provide a project-independent Vue 3 integration baseline without selecting an application locale, translation catalog, fallback policy, or warning policy.

#### Vue Router

The base preset uses:

```typescript
routerPlugin.getDefaultOptions();
```

The current plugin defaults are equivalent to:

```typescript
{
  history: createMemoryHistory(),
  routes: [],
}
```

The in-memory history isolates routing from browser URL state.

The empty route table avoids introducing application-specific routes.

Projects that need application routes or another history implementation should define them explicitly in a project-specific preset.

### `presets.piniaPreset`

A minimal preset containing only the managed Pinia integration.

```typescript
const { testComponentFactory } = createTestFramework({
  preset: presets.piniaPreset,
});
```

Pinia is enabled and the base preset explicitly uses:

```typescript
piniaPlugin.getDefaultOptions();
```

Because no runner is supplied, the base preset does not define `createSpy`.

Use a runner-specific preset when an explicit runner spy implementation is required.

### `presets.i18nPreset`

A minimal preset containing only Vue I18n.

```typescript
const { testComponentFactory } = createTestFramework({
  preset: presets.i18nPreset,
});
```

Vue I18n is enabled with the project-independent defaults consumed by the base preset from the plugin:

```typescript
{
  legacy: false,
  globalInjection: true,
}
```

Application-specific locale, messages, fallback behavior, formats, and warning policy are intentionally left to project configuration.

### `presets.routerPreset`

A minimal preset containing only Vue Router.

```typescript
const { testComponentFactory } = createTestFramework({
  preset: presets.routerPreset,
});
```

Vue Router is enabled with the project-independent defaults consumed by the base preset from the plugin:

```typescript
{
  history: createMemoryHistory(),
  routes: [],
}
```

A fresh in-memory history instance is created when the options factory is invoked.

The preset does not define synthetic application routes.

## Runner-Specific Presets

The base package intentionally does not choose a test runner.

TestForge-maintained runner-specific preset packages can reuse the base preset composition while replacing only configuration that depends on the runner.

For these reusable preset packages, the preferred approach is to use the plugin's own runner-aware defaults rather than reproducing plugin integration knowledge manually.

For Vitest:

```typescript
import { vi } from "vitest";

import { extendPreset } from "@testforgejs/vue-test-core";
import { piniaPlugin, PLUGIN_NAME as PINIA_PLUGIN_NAME } from "@testforgejs/vue-test-plugin-pinia";
import { presets as basePresets } from "@testforgejs/vue-test-preset-base";

export const presets = {
  default: extendPreset(basePresets.default, {
    defaults: {
      [PINIA_PLUGIN_NAME]: piniaPlugin.getDefaultOptions(vi),
    },
  }),
};
```

For Jest:

```typescript
import { jest } from "@jest/globals";
import { extendPreset } from "@testforgejs/vue-test-core";
import { piniaPlugin, PLUGIN_NAME as PINIA_PLUGIN_NAME } from "@testforgejs/vue-test-plugin-pinia";
import { presets as basePresets } from "@testforgejs/vue-test-preset-base";

export const presets = {
  default: extendPreset(basePresets.default, {
    defaults: {
      [PINIA_PLUGIN_NAME]: piniaPlugin.getDefaultOptions(jest),
    },
  }),
};
```

This keeps knowledge about Pinia's integration baseline and plugin identifier inside the Pinia plugin package while allowing the TestForge-maintained runner preset to supply the runner context.

The dedicated Pinia preset can be adapted in the same way:

```typescript
export const presets = {
  piniaPreset: extendPreset(basePresets.piniaPreset, {
    defaults: {
      [PINIA_PLUGIN_NAME]: piniaPlugin.getDefaultOptions(vi),
    },
  }),
};
```

Runner-independent presets can normally be reused unchanged:

```typescript
export const presets = {
  i18nPreset: basePresets.i18nPreset,
  routerPreset: basePresets.routerPreset,
};
```

This use of `getDefaultOptions()` is intentional for TestForge-maintained reusable presets:

```text
plugin
→ owns reusable integration knowledge

base / recommended TestForge presets
→ intentionally follow that plugin baseline
```

Project-owned presets normally use explicit factories instead.

## Replacing Preset Defaults

Providing a plugin options factory while extending a preset replaces the corresponding factory from the source preset.

For example:

```typescript
extendPreset(basePresets.default, {
  defaults: {
    [PINIA_PLUGIN_NAME]: () => ({
      createSpy: vi.fn,
    }),
  },
});
```

The resulting Pinia configuration contains only the options returned by that replacement factory.

TestForge does not implicitly merge the replacement with the source preset factory or with `piniaPlugin.getDefaultOptions()`.

For a project-owned preset, this explicit replacement is normally preferable because the effective configuration remains visible in the project:

```typescript
extendPreset(basePresets.default, {
  defaults: {
    [PINIA_PLUGIN_NAME]: () => ({
      createSpy: vi.fn,
      stubActions: false,
    }),
  },
});
```

Here the project owns both choices:

```text
createSpy: vi.fn
→ explicit Vitest integration configuration

stubActions: false
→ project-specific action policy
```

A project can instead preserve and spread a source preset factory:

```typescript
const sourcePinia = recommendedPresets.default.defaults.pinia;

extendPreset(recommendedPresets.default, {
  defaults: {
    [PINIA_PLUGIN_NAME]: () => ({
      ...sourcePinia(),
      stubActions: false,
    }),
  },
});
```

but this has different semantics.

The resulting project preset intentionally continues to depend on the source preset factory. If that factory changes after a dependency update, the effective project configuration can change as well.

For project-owned configuration that should remain stable and directly visible in source, prefer materializing the values the project intends to preserve:

```typescript
extendPreset(recommendedPresets.default, {
  defaults: {
    [PINIA_PLUGIN_NAME]: () => ({
      createSpy: vi.fn,
      stubActions: false,
    }),
  },
});
```

Conceptually:

```text
reuse source factory
→ continue following source preset behavior

explicit replacement factory
→ project owns the resulting configuration
```

## Project-Specific Presets

Plugin defaults intentionally avoid application-specific configuration.

Projects should define their own presets when tests require behavior such as:

- application routes;
- translation messages or locales;
- real Pinia action execution;
- initial store state;
- application-specific plugins;
- custom history behavior;
- other project policy.

A project-owned preset should normally materialize its managed-plugin configuration directly rather than calling `getDefaultOptions()`.

For example:

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
import HomeView from "@/views/HomeView.vue";

export const projectPreset = {
  manifest: [
    {
      module: piniaPlugin,
      enabled: true,
    },
    {
      module: i18nPlugin,
      enabled: true,
    },
    {
      module: routerPlugin,
      enabled: true,
    },
  ],

  defaults: {
    [PINIA_PLUGIN_NAME]: () => ({
      createSpy: vi.fn,
      stubActions: false,
    }),

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
} satisfies PresetDefinition;
```

The project source now exposes the complete configuration it intentionally owns.

For Pinia:

```typescript
{
  createSpy: vi.fn,
  stubActions: false,
}
```

For Vue I18n:

```typescript
{
  legacy: false,
  globalInjection: true,
  locale: "en",
  messages,
}
```

For Vue Router:

```typescript
{
  history: createMemoryHistory(),
  routes,
}
```

Explicit project configuration does not mean listing every option supported by the underlying libraries.

Options that the project does not intentionally control should normally remain omitted so that the corresponding library behavior remains in effect.

For the common case where the application uses a single project-specific runtime environment, pass it directly through `preset`:

```typescript
import { createTestFramework } from "@testforgejs/vue-test-core";
import { projectPreset } from "./projectPreset";

export const { testComponentFactory } = createTestFramework({
  preset: projectPreset,
});
```

This is the preferred form when no runtime preset switching is required.

This separation is intentional:

```text
plugin
→ owns reusable integration knowledge
→ exposes getDefaultOptions() for reusable TestForge presets

base preset
→ runner-independent reusable composition
→ consumes plugin defaults

runner-specific TestForge preset
→ runner adaptation
→ consumes runner-aware plugin defaults

project-owned preset
→ materializes concrete configuration
→ owns application-specific behavior
```

This gives project configuration a different stability model from reusable TestForge presets:

```text
plugin update
     │
     ├─ TestForge-maintained preset
     │    → may intentionally follow updated getDefaultOptions()
     │
     └─ project-owned preset
          → explicit configuration remains unchanged
          → until the project changes it
```

## Preset Selection at Runtime

Use a preset registry when the same TestForge framework instance should expose multiple named runtime environments:

```typescript
import { createTestFramework } from "@testforgejs/vue-test-core";
import { presets } from "@testforgejs/vue-test-preset-base";

const { testComponentFactory } = createTestFramework({
  presets,
});
```

A component factory can then switch between registered presets for an individual invocation using the fourth `extraOptions` argument:

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

For example, selecting `i18nPreset` enables Vue I18n without automatically creating the Pinia or Router integrations.

The two similarly named options operate at different levels:

```text
createTestFramework({ preset })
→ configures one framework-wide runtime environment

createTestFramework({ presets })
→ registers multiple named runtime environments

extraOptions.preset
→ selects one registered runtime environment for a factory invocation
```

Runtime selection through `extraOptions.preset` applies to named presets registered through `presets`.

## Preset Isolation

Each preset represents a complete managed-plugin runtime environment.

A plugin that is not declared in the active preset manifest cannot be configured through TestForge's managed `plugins` API.

For example, this configuration is invalid when `i18nPreset` is active:

```typescript
factory(
  {},
  {
    plugins: {
      pinia: {},
    },
  },
  {},
  {
    preset: "i18nPreset",
  },
);
```

The active preset declares only Vue I18n, so the Pinia configuration is rejected during validation.

This isolation is intentional: presets are runtime environment profiles rather than partial configuration overlays.

The literal `pinia` key in this example is part of the consumer-facing runtime configuration API. It is separate from the use of `[PINIA_PLUGIN_NAME]` when authoring a preset's `defaults` object.

## Fresh Plugin Configuration

Preset defaults are plugin options factories rather than shared configuration objects.

The base preset stores those factories under the plugin's exported identifier:

```typescript
defaults: {
  [I18N_PLUGIN_NAME]: i18nPlugin.getDefaultOptions(),
}
```

The current I18n factory is equivalent to:

```typescript
() => ({
  legacy: false,
  globalInjection: true,
});
```

This `getDefaultOptions()` usage describes the implementation of the TestForge-maintained base preset. A project-owned preset would normally materialize the same baseline directly if it wants to own that configuration:

```typescript
defaults: {
  [I18N_PLUGIN_NAME]: () => ({
    legacy: false,
    globalInjection: true,
  }),
}
```

Because `I18N_PLUGIN_NAME` resolves to `"i18n"`, the resulting preset can still be consumed through its normal property key.

TestForge invokes the factory while resolving plugin configuration for a pipeline context.

Each invocation produces a fresh options object:

```typescript
const first = presets.default.defaults.i18n();
const second = presets.default.defaults.i18n();

first !== second; // true
```

Some factories also create fresh runtime configuration values.

For example, Router defaults create a new in-memory history instance for each invocation:

```typescript
const first = presets.routerPreset.defaults.router();
const second = presets.routerPreset.defaults.router();

first.history !== second.history; // true
```

This prevents mutable plugin configuration and runtime state from being unintentionally shared between independent pipeline contexts.

This distinction is important:

- a **plugin options factory** creates plugin configuration;
- a **component factory** created by `testComponentFactory()` creates component test mounts.

They operate at different levels of the TestForge architecture.

## Related Packages

- [`@testforgejs/vue-test-core`](https://www.npmjs.com/package/@testforgejs/vue-test-core) — core TestForge testing framework
- [`@testforgejs/vue-test-preset-recommended`](https://www.npmjs.com/package/@testforgejs/vue-test-preset-recommended) — recommended Vitest-oriented presets
- [`@testforgejs/vue-test-preset-recommended-jest`](https://www.npmjs.com/package/@testforgejs/vue-test-preset-recommended-jest) — recommended Jest-oriented presets
- [`@testforgejs/vue-test-plugin-pinia`](https://www.npmjs.com/package/@testforgejs/vue-test-plugin-pinia) — Pinia integration
- [`@testforgejs/vue-test-plugin-i18n`](https://www.npmjs.com/package/@testforgejs/vue-test-plugin-i18n) — Vue I18n integration
- [`@testforgejs/vue-test-plugin-router`](https://www.npmjs.com/package/@testforgejs/vue-test-plugin-router) — Vue Router integration

## License

MIT
