# @testforge/vue-test-core

> Core runtime & declarative testing infrastructure for Vue 3

This package provides the core runtime engine for **TestForge**. It is responsible for:

- Plugin registration and lifecycle
- The preset system
- Creating type-safe `testComponentFactory` instances
- A hierarchical configuration merge pipeline (Preset → Factory → Test → Extra)

Install one of the official presets together with the plugins you need.

## Installation

Choose your preferred package manager.

### pnpm

```bash
pnpm add -D @testforge/vue-test-core
```

### npm

```bash
npm install -D @testforge/vue-test-core
```

### Yarn

```bash
yarn add -D @testforge/vue-test-core
```

## Recommended setup

The fastest way to get started is to install the core and the official recommended preset:

```bash
npm install -D @testforge/vue-test-core @testforge/vue-test-preset-recommended
```

The `@testforge/vue-test-preset-recommended` preset automatically includes and configures the most popular plugins:

- Pinia
- Vue Router
- vue-i18n

> [!TIP]
> Want full control? The recommended preset is optional — you can build your own.

## Quick Usage

```typescript
import { createTestFramework } from "@testforge/vue-test-core";
import { presets } from "@testforge/vue-test-preset-recommended";

// Initialize the framework instance with selected presets and global plugins
const framework = createTestFramework({ presets });

// Export the configured, type-safe factory to use across your component tests
export const testComponentFactory = framework.testComponentFactory;
```

## Documentation

- Project documentation: https://github.com/testforgejs/testforge
- [Plugin authoring guide](../../docs/plugin-authoring-guide.md)
- [Preset authoring guide](../../docs/preset-authoring-guide.md)

## Related packages

- `@testforge/vue-test-preset-recommended`
- `@testforge/vue-test-plugin-router`
- `@testforge/vue-test-plugin-pinia`
- `@testforge/vue-test-plugin-i18n`
- `@testforge/vue-test-plugin-vuetify`
- `@testforge/vue-test-plugin-primevue`

## License

MIT
