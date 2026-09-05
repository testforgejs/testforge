# @testforgejs/vue-test-plugin-primevue

Official TestForge plugin for PrimeVue integration in component tests.

## Installation

Choose your preferred package manager.

### pnpm

```bash
pnpm add -D @testforgejs/vue-test-plugin-primevue@beta
```

### npm

```bash
npm install -D @testforgejs/vue-test-plugin-primevue@beta
```

### Yarn

```bash
yarn add -D @testforgejs/vue-test-plugin-primevue@beta
```

> `@testforgejs/vue-test-core` is required.

## Usage

Register `primeVuePlugin` in the TestForge plugin manifest.

```typescript
import { createTestFramework } from "@testforgejs/vue-test-core";
import { primeVuePlugin } from "@testforgejs/vue-test-plugin-primevue";

const framework = createTestFramework({
  presets: {
    default: {
      manifest: [
        {
          module: primeVuePlugin,
          enabled: true,
        },
      ],
      defaults: {
        primevue: () => ({
          theme: {
            preset: Aura,
          },
        }),
      },
    },
  },
});

const factory = framework.testComponentFactory(MyComponent);

const wrapper = factory();
```

`defaults.primevue` is an options factory. Each invocation produces a fresh PrimeVue options object for the current pipeline context.

The plugin provides PrimeVue integration for components mounted through TestForge.

## Supported versions

- Vue: 3.x
- PrimeVue: 3.x and 4.x

## Documentation

See the [TestForge documentation](https://github.com/testforgejs/testforge#readme).

### API Reference

See the [API reference](https://github.com/testforgejs/testforge/blob/main/packages/vue-test-plugin-primevue/docs/api/README.md).
