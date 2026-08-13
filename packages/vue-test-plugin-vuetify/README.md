# @testforgejs/vue-test-plugin-vuetify

Official TestForge plugin for Vuetify integration in component tests.

## Installation

Choose your preferred package manager.

### pnpm

```bash
pnpm add -D @testforgejs/vue-test-plugin-vuetify@beta
```

### npm

```bash
npm install -D @testforgejs/vue-test-plugin-vuetify@beta
```

### Yarn

```bash
yarn add -D @testforgejs/vue-test-plugin-vuetify@beta
```

> `@testforgejs/vue-test-core` is required.

## Usage

Register `vuetifyPlugin` in the TestForge plugin manifest.

```ts
import { createTestFramework } from "@testforgejs/vue-test-core";
import { vuetifyPlugin } from "@testforgejs/vue-test-plugin-vuetify";

const framework = createTestFramework({
  presets: {
    default: {
      manifest: [
        {
          module: vuetifyPlugin,
          enabled: true,
        },
      ],
    },
  },
});

const factory = framework.testComponentFactory(MyComponent);

const wrapper = factory();
```

The plugin provides Vuetify integration for components mounted through TestForge.

## Supported versions

- Vue: 3.x
- Vuetify: 3.x and 4.x

## Documentation

See the [TestForge documentation](https://github.com/testforgejs/testforge#readme).

### API Reference

See the [API reference](https://github.com/testforgejs/testforge/blob/main/packages/vue-test-plugin-vuetify/docs/api/README.md).
