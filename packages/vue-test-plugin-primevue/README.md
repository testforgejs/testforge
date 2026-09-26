# @testforgejs/vue-test-plugin-primevue

PrimeVue integration for TestForge component tests.

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

### Using plugin defaults

The plugin provides a project-independent default configuration through `getDefaultOptions()`:

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
        primevue: primeVuePlugin.getDefaultOptions(),
      },
    },
  },
});

const factory = framework.testComponentFactory(MyComponent);

const wrapper = factory();
```

`getDefaultOptions()` returns an options factory suitable for use in a preset.

The plugin-provided defaults enable PrimeVue unstyled mode:

```typescript
{
  unstyled: true,
}
```

Unstyled mode provides a project-independent baseline without requiring a theme preset. PrimeVue components retain their functionality and accessibility, while PrimeVue's built-in styled-mode theme rules are not applied.

Plugin defaults are **not applied automatically**. Adding the plugin to a preset manifest declares that the plugin is available and whether it is enabled; the preset explicitly decides whether to use the plugin-provided defaults or provide its own configuration.

### Providing custom options

You can define the PrimeVue configuration directly in the preset instead.

For example, a project that uses PrimeVue styled mode can provide its theme configuration:

```typescript
import Aura from "@primeuix/themes/aura";

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
```

Using `getDefaultOptions()` is optional. Define custom defaults when tests need to reproduce application-specific PrimeVue configuration such as a theme preset, pass-through configuration, locale settings, ripple effects, or other PrimeVue behavior.

If the configuration references a PrimeVue theme preset such as Aura, the corresponding PrimeVue theme package must also be available in the project.

## Configuration

### PrimeVue options

The plugin integrates TestForge with PrimeVue by registering the PrimeVue Vue plugin with the provided configuration.

Configuration fields such as `unstyled`, `theme`, `pt`, `ptOptions`, `locale`, `ripple`, `zIndex`, and other PrimeVue options belong to PrimeVue.

TestForge does not define an alternative configuration format for PrimeVue. The integration passes the provided configuration to the PrimeVue plugin during installation.

Refer to the PrimeVue documentation for the complete set of supported configuration options and their behavior.

### Styled and unstyled modes

The plugin-provided defaults use:

```typescript
{
  unstyled: true,
}
```

This is intended as a project-independent testing baseline and does not attempt to reproduce an application's visual theme.

If a component test depends on the application's PrimeVue theme or other styled-mode configuration, provide that configuration explicitly in a project-specific preset instead of relying on the plugin defaults.

For example:

```typescript
defaults: {
  primevue: () => ({
    theme: {
      preset: Aura,
    },
  }),
},
```

This keeps application-specific presentation policy in the project preset while the plugin provides a minimal reusable baseline.

### Options factories

Preset defaults are defined as factories:

```typescript
defaults: {
  primevue: () => ({
    theme: {
      preset: Aura,
    },
  }),
},
```

Each invocation of the factory produces a fresh options object for the current TestForge pipeline execution.

`primeVuePlugin.getDefaultOptions()` follows the same contract: it returns an options factory rather than a shared options object.

This allows presets to choose explicitly between:

- the project-independent defaults provided by the plugin; and
- a custom PrimeVue configuration defined by the preset.

## Package exports

The package provides both descriptive and standardized plugin exports:

```typescript
import { primeVuePlugin, plugin, PLUGIN_NAME } from "@testforgejs/vue-test-plugin-primevue";
```

### `primeVuePlugin`

The descriptive PrimeVue plugin module export.

### `plugin`

The standardized plugin module export.

It references the same plugin module as `primeVuePlugin` and provides a consistent package-level API across TestForge plugin packages.

### `PLUGIN_NAME`

The standardized plugin identifier export.

For this package:

```typescript
PLUGIN_NAME === "primevue";
```

The standardized `plugin` and `PLUGIN_NAME` exports are useful for tooling and other code that works with TestForge plugin packages generically.

## Supported versions

- Vue: 3.3.0 or higher
- PrimeVue: 4.x

## Documentation

See the [TestForge documentation](https://github.com/testforgejs/testforge#readme).

### API Reference

See the [API reference](https://github.com/testforgejs/testforge/blob/main/packages/vue-test-plugin-primevue/docs/api/README.md).
