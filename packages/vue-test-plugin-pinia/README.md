# @testforgejs/vue-test-plugin-pinia

Pinia integration for TestForge component tests.

## Installation

Choose your preferred package manager.

### pnpm

```bash
pnpm add -D @testforgejs/vue-test-plugin-pinia@beta
```

### npm

```bash
npm install -D @testforgejs/vue-test-plugin-pinia@beta
```

### Yarn

```bash
yarn add -D @testforgejs/vue-test-plugin-pinia@beta
```

> [!NOTE]
> `@testforgejs/vue-test-core`, `pinia`, and `@pinia/testing` are required. Make sure the installed versions satisfy the package's declared dependency requirements.

## Usage

### Using plugin defaults

The plugin provides a project-independent default configuration through `getDefaultOptions()`.

When using Vitest, you can pass `vi` as the runner:

```typescript
import { vi } from "vitest";
import { createTestFramework } from "@testforgejs/vue-test-core";
import {
  piniaPlugin,
  PLUGIN_NAME as PINIA_PLUGIN_NAME,
} from "@testforgejs/vue-test-plugin-pinia";

const framework = createTestFramework({
  preset: {
    manifest: [
      {
        module: piniaPlugin,
        enabled: true,
      },
    ],
    defaults: {
      [PINIA_PLUGIN_NAME]: piniaPlugin.getDefaultOptions(vi),
    },
  },
});
```

For Jest, pass `jest` instead:

```typescript
pinia: piniaPlugin.getDefaultOptions(jest),
```

Passing a runner is optional:

```typescript
pinia: piniaPlugin.getDefaultOptions(),
```

`getDefaultOptions()` returns an options factory suitable for use in a preset.

The plugin-provided defaults are equivalent to:

```typescript
{
  createSpy: runner?.fn,
}
```

When a runner is provided, its `fn` implementation is passed to `@pinia/testing` as `createSpy`.

When the runner is omitted, `createSpy` is left undefined and `@pinia/testing` handles spy resolution according to its own behavior. This can be useful in environments where the test runner exposes supported globals.

The plugin intentionally does not override other `createTestingPinia()` options. As a result, behavior such as action stubbing, initial state, `$patch()` handling, and `$reset()` handling follows the defaults provided by `@pinia/testing`.

In particular, store actions are stubbed by default and therefore do not execute their implementations unless `stubActions: false` is configured explicitly.

Plugin defaults are **not applied automatically**. Adding the plugin to a preset manifest declares that the plugin is available and whether it is enabled; the preset explicitly decides whether to use the plugin-provided defaults or provide its own configuration.

### Providing custom options

You can define the Pinia testing configuration directly in the preset instead:

```typescript
import { vi } from "vitest";
import { createTestFramework } from "@testforgejs/vue-test-core";
import {
  piniaPlugin,
  PLUGIN_NAME as PINIA_PLUGIN_NAME,
} from "@testforgejs/vue-test-plugin-pinia";
import type { PluginOptions as PiniaPluginOptions } from "@testforgejs/vue-test-plugin-pinia";

const framework = createTestFramework({
  preset: {
    manifest: [
      {
        module: piniaPlugin,
        enabled: true,
      },
    ],
    defaults: {
      [PINIA_PLUGIN_NAME]: () => ({
        initialState: {
          user: {
            name: "Test User",
          },
        },
        stubActions: false,
        createSpy: vi.fn,
      }) satisfies PiniaPluginOptions,
    },
  },
});
```

The standardized `PluginOptions` type provides type-safe configuration through `satisfies` while preserving TypeScript's inferred type for the returned options.

Using `getDefaultOptions()` is optional. Define custom defaults when tests require application-specific initial state, real action execution, Pinia plugins, or other testing behavior.

## Configuration

### Pinia testing options

The plugin integrates TestForge with Pinia using `@pinia/testing` and `createTestingPinia()`.

Configuration fields such as `initialState`, `stubActions`, `createSpy`, `plugins`, `fakeApp`, `stubPatch`, and `stubReset` are provided by `@pinia/testing`.

For example:

- `initialState` provides initial state for stores created by the testing Pinia.
- `stubActions` controls whether store actions execute or are replaced by spies.
- `createSpy` specifies the spy implementation used for actions and other mocked operations.
- `plugins` installs application Pinia plugins into the testing Pinia.
- `fakeApp` creates an application and installs the testing Pinia into it.
- `stubPatch` controls whether `$patch()` modifies store state.
- `stubReset` controls whether `$reset()` modifies store state.

TestForge does not redefine these Pinia testing options. The integration passes them to `createTestingPinia()` when creating the Pinia instance.

Refer to the Pinia documentation for the complete set of `TestingOptions` and their behavior.

For additional store initialization and modification before mounting, see [Configuring stores with `withMockStores()`](#configuring-stores-with-withmockstores).

### Configuring stores with `withMockStores()`

The TestForge Pinia plugin provides the `withMockStores()` helper for configuring stores before a component is mounted. It accepts a callback that receives the testing Pinia instance used by the mounted component.

Unlike the native `initialState` option, which initializes store state, `withMockStores()` lets you access stores directly and perform additional setup, including calling store actions.

```typescript
import { withMockStores } from "@testforgejs/vue-test-plugin-pinia";

factory(
  {},
  {
    plugins: {
      pinia: {
        stubActions: false,
        ...withMockStores((pinia) => {
          const store = useCounterStore(pinia);
          store.setCount(42);
        }),
      },
    },
  },
);
```

The callback runs after the Pinia instance has been resolved and before the component is mounted. This applies to newly created instances and explicitly reused instances alike.

When calling store actions inside `withMockStores()`, configure `stubActions: false` if their implementations need to execute. By default, `createTestingPinia()` stubs store actions.

The configuration returned by `withMockStores()` can be used in per-mount plugin options or factory-level defaults. The callback is invoked for each mount that uses the configuration and receives that mount's resolved Pinia instance.

#### Configuring an existing Pinia instance

The `withMockStores()` callback also runs when an existing Pinia instance is supplied using `withPluginInstance()`. This allows you to configure stores on an explicitly reused instance without creating a new Pinia instance.

```typescript
import { createTestingPinia } from "@pinia/testing";
import { vi } from "vitest";
import { withPluginInstance } from "@testforgejs/vue-test-core";
import { withMockStores } from "@testforgejs/vue-test-plugin-pinia";

const pinia = createTestingPinia({
  createSpy: vi.fn,
  stubActions: false,
});

factory(
  {},
  {},
  {},
  {
    plugins: {
      pinia: {
        ...withPluginInstance(pinia),
        ...withMockStores((pinia) => {
          const store = useCounterStore(pinia);
          store.count = 42;
        }),
      },
    },
  },
);
```

In this example:

- TestForge reuses the supplied Pinia instance instead of creating a new one.
- The `withMockStores()` callback receives that same instance.
- The callback modifies the store before the component is mounted.

Native `createTestingPinia()` options should be configured when creating the instance. Using `withPluginInstance()` reuses that instance rather than recreating it with new testing options.

#### Shared instance isolation

**Using `withPluginInstance()` explicitly enables instance reuse.** When the same instance is reused across multiple mounts, the mounted components share its stores and reactive state. State changes made during one mount may affect other components using that instance.

The `withMockStores()` callback runs for **each mount** that configures it and operates on the resolved instance. When that instance is shared, the callback can modify stores that were initialized during an earlier mount. TestForge does not automatically reset or clone explicitly reused plugin instances.

For independent tests, let TestForge create a fresh Pinia instance for each mount. If a test requires `withPluginInstance()`, create the supplied Pinia instance separately for each test unless shared state is an intentional part of the scenario.

Reusing the same `withMockStores()` configuration **does not itself share Pinia state**: it is the explicit reuse of an instance via `withPluginInstance()` that causes the mounts to share state, assuming the callback does not depend on other shared mutable data.

### TestForge plugin defaults

The defaults provided by this package intentionally contain only the runner integration:

```typescript
{
  createSpy: runner?.fn,
}
```

When a runner is provided, TestForge supplies its mock-function implementation to `@pinia/testing`.

The plugin does not explicitly configure:

```typescript
initialState;
stubActions;
plugins;
fakeApp;
stubPatch;
stubReset;
```

These options therefore retain the behavior defined by `createTestingPinia()`.

This keeps the plugin defaults project-independent and avoids overriding Pinia testing behavior when TestForge does not need to do so.

For example, `createTestingPinia()` stubs store actions by default. To execute action implementations while keeping them observable as spies, configure:

```typescript
defaults: {
  pinia: () => ({
    stubActions: false,
    createSpy: vi.fn,
  }),
},
```

### Runner integration

`getDefaultOptions()` optionally accepts a TestForge-compatible runner.

With Vitest:

```typescript
piniaPlugin.getDefaultOptions(vi);
```

With Jest:

```typescript
piniaPlugin.getDefaultOptions(jest);
```

The runner's `fn` implementation is used as the `createSpy` option for `@pinia/testing`.

Passing the runner explicitly makes the spy implementation part of the preset configuration and avoids depending on test-runner globals.

The runner can also be omitted:

```typescript
piniaPlugin.getDefaultOptions();
```

In that case, the plugin does not provide a spy implementation and `@pinia/testing` is responsible for resolving one from the test environment.

For example, `@pinia/testing` can use Jest globals automatically and can use Vitest globals when Vitest is configured with `globals: true`.

### Options factories

Preset defaults are defined as factories:

```typescript
defaults: {
  pinia: () => ({
    initialState: {
      user: {
        name: "Test User",
      },
    },
    stubActions: false,
    createSpy: vi.fn,
  }),
},
```

Each invocation of the factory produces a fresh options object for the current TestForge pipeline execution.

`piniaPlugin.getDefaultOptions(runner)` follows the same contract: it returns an options factory rather than a shared options object.

This allows presets to choose explicitly between:

- the project-independent defaults provided by the plugin; and
- a custom Pinia testing configuration defined by the preset.

## Package exports

The package provides descriptive Pinia APIs and the standardized TestForge plugin package contract:

```typescript
import {
  piniaPlugin,
  withMockStores,
  plugin,
  PLUGIN_NAME,
  type PluginOptions,
} from "@testforgejs/vue-test-plugin-pinia";
```

`plugin` and `PLUGIN_NAME` are runtime exports. `PluginOptions` is a **TypeScript-only** export and is not available as a runtime value.

### `piniaPlugin`

The descriptive Pinia plugin module export.

### `withMockStores()`

A helper that adds a symbol-keyed store setup callback to managed Pinia plugin options. See [Configuring stores with `withMockStores()`](#configuring-stores-with-withmockstores) for examples.

### `plugin`

The standardized plugin module export.

It references the same plugin module as `piniaPlugin` and provides a consistent package-level API across TestForge plugin packages.

### `PLUGIN_NAME`

The standardized plugin identifier export.

For this package:

```typescript
PLUGIN_NAME === "pinia";
```

### `PluginOptions` (type-only)

`PluginOptions` is the standardized public options type exported by TestForge plugin packages. For the Pinia integration, it is an alias for the existing `VueTestPiniaOptions` type. In `src/index.ts`, the package declares:

```typescript
export type { VueTestPiniaOptions as PluginOptions } from "./types/types.js";
```

Both names describe the same Pinia plugin configuration. The original `VueTestPiniaOptions` type remains available; `PluginOptions` adds a consistent import name for consumers and tooling that work with different TestForge plugin packages. This is a **type alias only**: it does not change the configuration shape or the runtime behavior of the plugin.

Use `import type` to type Pinia configuration explicitly:

```typescript
import { vi } from "vitest";
import type { PluginOptions } from "@testforgejs/vue-test-plugin-pinia";

const options: PluginOptions = {
  createSpy: vi.fn,
  stubActions: false,
};
```

You can also use the standardized exports together when defining a preset:

```typescript
import { vi } from "vitest";
import type { PresetDefinition } from "@testforgejs/vue-test-core";
import { plugin, PLUGIN_NAME, type PluginOptions } from "@testforgejs/vue-test-plugin-pinia";

const preset = {
  manifest: [{ module: plugin, enabled: true }],
  defaults: {
    [PLUGIN_NAME]: (): PluginOptions => ({
      createSpy: vi.fn,
      stubActions: false,
    }),
  },
} satisfies PresetDefinition;
```

The standardized package contract is:

- `plugin` — the managed plugin module (runtime value);
- `PLUGIN_NAME` — the managed plugin identifier (runtime value);
- `PluginOptions` — the plugin configuration type (TypeScript-only).

The standardized exports are useful for tooling and other code that works with TestForge plugin packages generically, while the descriptive exports remain available for direct Pinia integrations.

## Supported versions

- Vue: 3.3.0 or higher
- Pinia: 3.x and 4.x
- `@pinia/testing`: 1.x and 2.x

## Documentation

See the [TestForge documentation](https://github.com/testforgejs/testforge#readme).

### API Reference

See the [API reference](https://github.com/testforgejs/testforge/blob/main/packages/vue-test-plugin-pinia/docs/api/README.md).
