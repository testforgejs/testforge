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

> `@testforgejs/vue-test-core`, `pinia`, and `@pinia/testing` are required.

## Usage

### Using plugin defaults

The plugin provides a project-independent default configuration through `getDefaultOptions()`.

When using Vitest, you can pass `vi` as the runner:

```typescript
import { vi } from "vitest";

import { createTestFramework } from "@testforgejs/vue-test-core";
import { piniaPlugin } from "@testforgejs/vue-test-plugin-pinia";

const framework = createTestFramework({
  presets: {
    default: {
      manifest: [
        {
          module: piniaPlugin,
          enabled: true,
        },
      ],
      defaults: {
        pinia: piniaPlugin.getDefaultOptions(vi),
      },
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
import { piniaPlugin } from "@testforgejs/vue-test-plugin-pinia";

const framework = createTestFramework({
  presets: {
    default: {
      manifest: [
        {
          module: piniaPlugin,
          enabled: true,
        },
      ],
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
    },
  },
});
```

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

The package provides both descriptive and standardized plugin exports:

```typescript
import { piniaPlugin, plugin, PLUGIN_NAME } from "@testforgejs/vue-test-plugin-pinia";
```

### `piniaPlugin`

The descriptive Pinia plugin module export.

### `plugin`

The standardized plugin module export.

It references the same plugin module as `piniaPlugin` and provides a consistent package-level API across TestForge plugin packages.

### `PLUGIN_NAME`

The standardized plugin identifier export.

For this package:

```typescript
PLUGIN_NAME === "pinia";
```

The standardized `plugin` and `PLUGIN_NAME` exports are useful for tooling and other code that works with TestForge plugin packages generically.

## Supported versions

- Vue: 3.3.0 or higher
- Pinia: 3.x and 4.x
- `@pinia/testing`: 1.x and 2.x

## Documentation

See the [TestForge documentation](https://github.com/testforgejs/testforge#readme).

### API Reference

See the [API reference](https://github.com/testforgejs/testforge/blob/main/packages/vue-test-plugin-pinia/docs/api/README.md).
