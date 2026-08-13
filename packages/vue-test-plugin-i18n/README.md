# @testforgejs/vue-test-plugin-i18n

Vue I18n integration for TestForge component tests.

## Installation

Choose your preferred package manager.

### pnpm

```bash
pnpm add -D @testforgejs/vue-test-plugin-i18n@beta
```

### npm

```bash
npm install -D @testforgejs/vue-test-plugin-i18n@beta
```

### Yarn

```bash
yarn add -D @testforgejs/vue-test-plugin-i18n@beta
```

> `@testforgejs/vue-test-core` is required.

## Usage

```typescript
import { createTestFramework } from "@testforgejs/vue-test-core";
import { i18nPlugin } from "@testforgejs/vue-test-plugin-i18n";

const framework = createTestFramework({
  presets: {
    default: {
      manifest: [
        {
          module: i18nPlugin,
          enabled: true,
        },
      ],
    },
  },
});
```

## Supported versions

- Vue I18n: 9–11
- Vue: 3.x

## Documentation

See the [TestForge documentation](https://github.com/testforgejs/testforge#readme).

### API Reference

See the [API reference](https://github.com/testforgejs/testforge/blob/main/packages/vue-test-plugin-i18n/docs/api/README.md).
