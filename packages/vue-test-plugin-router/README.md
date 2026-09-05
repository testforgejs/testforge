# @testforgejs/vue-test-plugin-router

Official TestForge plugin for Vue Router integration in component tests.

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

> `@testforgejs/vue-test-core` is required.

## Usage

Register `routerPlugin` in the TestForge plugin manifest.

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
        router: () => ({
          routes: [
            {
              path: "/",
              component: { render: () => null },
            },
          ],
        }),
      },
    },
  },
});

const factory = framework.testComponentFactory(MyComponent);

const wrapper = factory();
```

`defaults.router` is an options factory. Each invocation produces a fresh Vue Router options object for the current pipeline context.

The default configuration provides a minimal `/` route so that Vue Router is ready to use without requiring application-specific routes.

For tests that depend on application routes, [create a project-specific preset](https://github.com/testforgejs/testforge/blob/main/docs/preset-authoring-guide.md) that provides the router configuration required by the application.

The plugin provides Vue Router integration for components mounted through TestForge.

## Supported versions

- Vue: 3.x
- Vue Router: 4.x and 5.x

## Documentation

See the [TestForge documentation](https://github.com/testforgejs/testforge#readme).

### API Reference

See the [API reference](https://github.com/testforgejs/testforge/blob/main/packages/vue-test-plugin-router/docs/api/README.md).
