# @testforgejs/vue-test-plugin-router

Vue Router integration for TestForge component tests.

## Installation

Choose your preferred package manager.

### pnpm

```bash
pnpm add -D @testforgejs/vue-test-plugin-router@beta
```

### npm

```bash
npm install -D @testforgejs/vue-test-plugin-router@beta
```

### Yarn

```bash
yarn add -D @testforgejs/vue-test-plugin-router@beta
```

> `@testforgejs/vue-test-core` and `vue-router` are required.

## Usage

### Using plugin defaults

The plugin provides a project-independent default configuration through `getDefaultOptions()`:

```typescript
import { createTestFramework } from "@testforgejs/vue-test-core";
import { routerPlugin } from "@testforgejs/vue-test-plugin-router";

const framework = createTestFramework({
  presets: {
    default: {
      manifest: [
        {
          module: routerPlugin,
          enabled: true,
        },
      ],
      defaults: {
        router: routerPlugin.getDefaultOptions(),
      },
    },
  },
});

const factory = framework.testComponentFactory(MyComponent);

const wrapper = factory();
```

`getDefaultOptions()` returns an options factory suitable for use in a preset.

The plugin-provided defaults are equivalent to:

```typescript
{
  history: createMemoryHistory(),
  routes: [],
}
```

The in-memory history keeps router state isolated from the browser environment, while the empty route table avoids introducing application-specific routes.

These defaults provide the minimum Vue Router configuration required to create a router instance. They do not define routes or other routing behavior on behalf of the application.

Plugin defaults are **not applied automatically**. Adding the plugin to a preset manifest declares that the plugin is available and whether it is enabled; the preset explicitly decides whether to use the plugin-provided defaults or provide its own configuration.

### Providing custom options

You can define the Vue Router configuration directly in the preset instead:

```typescript
import { createMemoryHistory } from "vue-router";

import { createTestFramework } from "@testforgejs/vue-test-core";
import { routerPlugin } from "@testforgejs/vue-test-plugin-router";

const framework = createTestFramework({
  presets: {
    default: {
      manifest: [
        {
          module: routerPlugin,
          enabled: true,
        },
      ],
      defaults: {
        router: () => ({
          history: createMemoryHistory(),
          routes: [
            {
              path: "/",
              component: { render: () => null },
            },
            {
              path: "/users/:id",
              component: UserDetails,
            },
          ],
        }),
      },
    },
  },
});
```

Using `getDefaultOptions()` is optional. Define custom defaults when tests require application-specific routes, a different history implementation, navigation behavior, or other Vue Router configuration.

For tests that depend on application routes, [create a project-specific preset](https://github.com/testforgejs/testforge/blob/main/docs/preset-authoring-guide.md) that provides the router configuration required by the application.

## Configuration

### Vue Router options

The plugin integrates TestForge with Vue Router by creating a router from the provided Vue Router options.

Configuration fields such as `history`, `routes`, `scrollBehavior`, `linkActiveClass`, and other router options belong to Vue Router.

TestForge does not define an alternative router configuration format. The integration passes these options to Vue Router when creating the router instance.

Refer to the Vue Router documentation for the complete set of supported router options and their behavior.

### TestForge plugin defaults

The defaults provided by this package intentionally contain only the configuration required to create an isolated, project-independent router:

```typescript
{
  history: createMemoryHistory(),
  routes: [],
}
```

`createMemoryHistory()` is used regardless of whether the test environment exposes browser globals. This keeps the default router isolated from `window.location` and browser history state and makes the configuration consistent across test environments.

The route table is empty because TestForge does not know the routes defined by the application. Application routes should be supplied by a project-specific preset or other explicit test configuration.

The plugin does not add a synthetic `/` route or otherwise define application routing behavior.

If tests require actual routes, provide them explicitly:

```typescript
defaults: {
  router: () => ({
    history: createMemoryHistory(),
    routes: [
      {
        path: "/users/:id",
        component: UserDetails,
      },
    ],
  }),
},
```

Likewise, if tests specifically depend on browser history behavior, provide the appropriate Vue Router history implementation explicitly.

### Options factories

Preset defaults are defined as factories:

```typescript
defaults: {
  router: () => ({
    history: createMemoryHistory(),
    routes: [],
  }),
},
```

Each invocation of the factory produces a fresh options object for the current TestForge pipeline execution, including a fresh in-memory history instance.

`routerPlugin.getDefaultOptions()` follows the same contract: it returns an options factory rather than a shared options object.

This allows presets to choose explicitly between:

- the minimal project-independent defaults provided by the plugin; and
- a custom Vue Router configuration defined by the preset.

## Package exports

The package provides both descriptive and standardized plugin exports:

```typescript
import { routerPlugin, plugin, PLUGIN_NAME } from "@testforgejs/vue-test-plugin-router";
```

### `routerPlugin`

The descriptive Vue Router plugin module export.

### `plugin`

The standardized plugin module export.

It references the same plugin module as `routerPlugin` and provides a consistent package-level API across TestForge plugin packages.

### `PLUGIN_NAME`

The standardized plugin identifier export.

For this package:

```typescript
PLUGIN_NAME === "router";
```

The standardized `plugin` and `PLUGIN_NAME` exports are useful for tooling and other code that works with TestForge plugin packages generically.

## Supported versions

- Vue: 3.3.0 or higher
- Vue Router: 4.x and 5.x

## Documentation

See the [TestForge documentation](https://github.com/testforgejs/testforge#readme).

### API Reference

See the [API reference](https://github.com/testforgejs/testforge/blob/main/packages/vue-test-plugin-router/docs/api/README.md).
