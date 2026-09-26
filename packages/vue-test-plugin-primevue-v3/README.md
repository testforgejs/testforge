# @testforgejs/vue-test-plugin-primevue-v3

PrimeVue 3 integration for TestForge component tests.

## Installation

Choose your preferred package manager.

### pnpm

```bash
pnpm add -D @testforgejs/vue-test-plugin-primevue-v3@beta
```

### npm

```bash
npm install -D @testforgejs/vue-test-plugin-primevue-v3@beta
```

### Yarn

```bash
yarn add -D @testforgejs/vue-test-plugin-primevue-v3@beta
```

> `@testforgejs/vue-test-core` is required.

## Usage

### Using plugin defaults

The plugin provides a project-independent default configuration through `getDefaultOptions()`:

```typescript
import { createTestFramework } from "@testforgejs/vue-test-core";
import { primeVuePlugin } from "@testforgejs/vue-test-plugin-primevue-v3";

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
        primevueV3: primeVuePlugin.getDefaultOptions(),
      },
    },
  },
});

const factory = framework.testComponentFactory(MyComponent);

const wrapper = factory();
```

`getDefaultOptions()` returns an options factory suitable for use in a preset.

The plugin-provided defaults use an empty PrimeVue configuration:

```typescript
{
}
```

This preserves PrimeVue 3's standard configuration without introducing project-specific behavior or forcing unstyled mode.

Plugin defaults are **not applied automatically**. Adding the plugin to a preset manifest declares that the plugin is available and whether it is enabled; the preset explicitly decides whether to use the plugin-provided defaults or provide its own configuration.

### Providing custom options

You can define the PrimeVue configuration directly in the preset instead:

```typescript
import { createTestFramework } from "@testforgejs/vue-test-core";
import { primeVuePlugin } from "@testforgejs/vue-test-plugin-primevue-v3";

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
        primevueV3: () => ({
          ripple: true,
          inputStyle: "filled",
        }),
      },
    },
  },
});
```

Using `getDefaultOptions()` is optional. Define custom defaults when tests require application-specific PrimeVue configuration such as ripple effects, input styling, locale settings, pass-through configuration, unstyled mode, or other PrimeVue behavior.

## Configuration

### PrimeVue options

The plugin integrates TestForge with PrimeVue 3 by registering the PrimeVue Vue plugin with the provided configuration.

Configuration fields such as `ripple`, `inputStyle`, `locale`, `pt`, `unstyled`, and other PrimeVue options belong to PrimeVue.

TestForge does not define an alternative configuration format for PrimeVue. The integration passes the provided configuration to the PrimeVue plugin during installation.

Refer to the PrimeVue 3 documentation for the complete set of supported configuration options and their behavior.

### Styled and unstyled modes

The plugin-provided defaults do not select a styling mode explicitly:

```typescript
{
}
```

PrimeVue 3 uses styled mode by default. Application themes in styled mode are configured separately by loading the corresponding PrimeVue theme CSS.

For example, theme setup belongs to the application's test environment or project configuration rather than the TestForge plugin options.

PrimeVue 3 also supports unstyled mode when explicitly enabled:

```typescript
defaults: {
  primevueV3: () => ({
    unstyled: true,
  }),
},
```

Use a project-specific preset when component tests need to reproduce application-specific PrimeVue configuration.

### Options factories

Preset defaults are defined as factories:

```typescript
defaults: {
  primevueV3: () => ({
    ripple: true,
    inputStyle: "filled",
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
import { primeVuePlugin, plugin, PLUGIN_NAME } from "@testforgejs/vue-test-plugin-primevue-v3";
```

### `primeVuePlugin`

The descriptive PrimeVue 3 plugin module export.

### `plugin`

The standardized plugin module export.

It references the same plugin module as `primeVuePlugin` and provides a consistent package-level API across TestForge plugin packages.

### `PLUGIN_NAME`

The standardized plugin identifier export.

For this package:

```typescript
PLUGIN_NAME === "primevueV3";
```

The standardized `plugin` and `PLUGIN_NAME` exports are useful for tooling and other code that works with TestForge plugin packages generically.

## Supported versions

- Vue: 3.3.0 or higher
- PrimeVue: 3.x

## Documentation

See the [TestForge documentation](https://github.com/testforgejs/testforge#readme).

### API Reference

See the [API reference](https://github.com/testforgejs/testforge/blob/main/packages/vue-test-plugin-primevue-v3/docs/api/README.md).
