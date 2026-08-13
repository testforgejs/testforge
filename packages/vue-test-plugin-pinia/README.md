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

> `@testforgejs/vue-test-core` is required.

## Usage

Register `piniaPlugin` in the TestForge plugin manifest.

```ts
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
    },
  },
});
```

The plugin provides a Pinia instance for components mounted through TestForge.

## Supported versions

- Vue: 3.x
- Pinia: 3.x

## Documentation

See the [TestForge documentation](https://github.com/testforgejs/testforge#readme).

### API Reference

See the [API reference](https://github.com/testforgejs/testforge/blob/main/packages/vue-test-plugin-pinia/docs/api/README.md).
