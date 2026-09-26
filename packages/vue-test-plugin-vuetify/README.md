# @testforgejs/vue-test-plugin-vuetify

Vuetify integration for TestForge component tests.

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

### Using plugin defaults

The plugin provides a project-independent default configuration through `getDefaultOptions()`:

```typescript
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
      defaults: {
        vuetify: vuetifyPlugin.getDefaultOptions(),
      },
    },
  },
});

const factory = framework.testComponentFactory(MyComponent);

const wrapper = factory();
```

`getDefaultOptions()` returns an options factory suitable for use in a preset.

The plugin-provided defaults register Vuetify components and directives, providing a functional Vuetify environment for typical component tests without requiring project-specific configuration.

Plugin defaults are **not applied automatically**. Adding the plugin to a preset manifest declares that the plugin is available and whether it is enabled; the preset explicitly decides whether to use the plugin-provided defaults or provide its own configuration.

### Providing custom options

You can define the Vuetify configuration directly in the preset instead:

```typescript
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";

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
      defaults: {
        vuetify: () => ({
          components,
          directives,
          defaults: {
            VBtn: {
              variant: "text",
            },
          },
        }),
      },
    },
  },
});
```

Using `getDefaultOptions()` is optional. Define custom defaults when tests require project-specific component defaults, themes, icons, locales, or other Vuetify configuration.

## Configuration

### Vuetify options

The plugin integrates TestForge with Vuetify.

Configuration fields such as `components`, `directives`, `defaults`, `theme`, `icons`, and other Vuetify options belong to Vuetify and are used when creating the Vuetify plugin instance.

TestForge does not define an alternative configuration format for Vuetify. The integration passes the Vuetify configuration to the underlying library when creating the plugin instance.

Refer to the Vuetify documentation for the complete set of supported configuration options and their behavior.

### Options factories

Preset defaults are defined as factories:

```typescript
defaults: {
  vuetify: () => ({
    components,
    directives,
    defaults: {
      VBtn: {
        variant: "text",
      },
    },
  }),
},
```

Each invocation of the factory produces a fresh options object for the current TestForge pipeline execution.

`vuetifyPlugin.getDefaultOptions()` follows the same contract: it returns an options factory rather than a shared options object.

This allows presets to choose explicitly between:

- the project-independent defaults provided by the plugin; and
- a custom Vuetify configuration defined by the preset.

## Package exports

The package provides both descriptive and standardized plugin exports:

```typescript
import { vuetifyPlugin, plugin, PLUGIN_NAME } from "@testforgejs/vue-test-plugin-vuetify";
```

### `vuetifyPlugin`

The descriptive Vuetify plugin module export.

### `plugin`

The standardized plugin module export.

It references the same plugin module as `vuetifyPlugin` and provides a consistent package-level API across TestForge plugin packages.

### `PLUGIN_NAME`

The standardized plugin identifier export.

For this package:

```typescript
PLUGIN_NAME === "vuetify";
```

The standardized `plugin` and `PLUGIN_NAME` exports are useful for tooling and other code that works with TestForge plugin packages generically.

## Supported versions

- Vue: 3.3.0 or higher
- Vuetify: 3.x and 4.x

## Documentation

See the [TestForge documentation](https://github.com/testforgejs/testforge#readme).

### API Reference

See the [API reference](https://github.com/testforgejs/testforge/blob/main/packages/vue-test-plugin-vuetify/docs/api/README.md).
