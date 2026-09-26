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

> `@testforgejs/vue-test-core` and `vue-i18n` are required.

## Usage

### Using plugin defaults

The plugin provides a project-independent default configuration through `getDefaultOptions()`:

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
      defaults: {
        i18n: i18nPlugin.getDefaultOptions(),
      },
    },
  },
});
```

`getDefaultOptions()` returns an options factory suitable for use in a preset.

The plugin-provided defaults are equivalent to:

```typescript
{
  legacy: false,
  globalInjection: true,
}
```

These defaults configure Vue I18n to use Composition API mode and make the global Composer properties and functions available to components through Vue's global properties.

The plugin intentionally does not define application-specific localization behavior such as the active locale, fallback locale, messages, formats, or warning policy.

Plugin defaults are **not applied automatically**. Adding the plugin to a preset manifest declares that the plugin is available and whether it is enabled; the preset explicitly decides whether to use the plugin-provided defaults or provide its own configuration.

### Providing custom options

You can define the Vue I18n configuration directly in the preset instead:

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
      defaults: {
        i18n: () => ({
          legacy: false,
          globalInjection: true,
          locale: "en",
          fallbackLocale: "en",
          messages: {
            en: {
              hello: "Hello",
            },
          },
        }),
      },
    },
  },
});
```

Using `getDefaultOptions()` is optional. Define custom defaults when tests require application-specific locales, messages, fallback behavior, formatting, warning policy, or other Vue I18n configuration.

## Configuration

### Vue I18n options

The plugin integrates TestForge with Vue I18n by creating a Vue I18n instance from the provided `createI18n()` options.

Configuration fields such as `legacy`, `globalInjection`, `locale`, `fallbackLocale`, `messages`, `missingWarn`, and `fallbackWarn` belong to Vue I18n.

TestForge does not define an alternative configuration format for Vue I18n. The integration passes these options to Vue I18n when creating the plugin instance.

Refer to the Vue I18n documentation for the complete set of supported `createI18n()` options and their behavior.

### TestForge plugin defaults

The defaults provided by this package intentionally contain only:

```typescript
{
  legacy: false,
  globalInjection: true,
}
```

`legacy: false` selects Vue I18n's Composition API mode. This provides a modern Vue 3 integration and allows components to use APIs such as `useI18n()`.

`globalInjection: true` makes global Composer properties and functions such as `$t`, `$d`, and `$n` available to components through Vue's global properties.

Setting `globalInjection` explicitly also provides consistent behavior across the supported Vue I18n versions instead of depending on version-specific defaults.

The plugin does not explicitly configure:

```typescript
locale;
fallbackLocale;
messages;
missingWarn;
fallbackWarn;
```

These options therefore retain the behavior defined by Vue I18n unless a preset provides them explicitly.

This keeps plugin defaults project-independent and avoids TestForge choosing an application locale, translation catalog, fallback strategy, or warning policy.

For example, a project-specific preset can provide its actual localization configuration:

```typescript
defaults: {
  i18n: () => ({
    legacy: false,
    globalInjection: true,
    locale: "en",
    fallbackLocale: "en",
    messages: {
      en: {
        hello: "Hello",
      },
    },
  }),
},
```

If a test environment intentionally needs to suppress missing-translation or fallback warnings, that policy can also be configured explicitly:

```typescript
defaults: {
  i18n: () => ({
    legacy: false,
    globalInjection: true,
    missingWarn: false,
    fallbackWarn: false,
  }),
},
```

### Options factories

Preset defaults are defined as factories:

```typescript
defaults: {
  i18n: () => ({
    legacy: false,
    globalInjection: true,
  }),
},
```

Each invocation of the factory produces a fresh options object for the current TestForge pipeline execution.

`i18nPlugin.getDefaultOptions()` follows the same contract: it returns an options factory rather than a shared options object.

This allows presets to choose explicitly between:

- the project-independent defaults provided by the plugin; and
- a custom Vue I18n configuration defined by the preset.

## Package exports

The package provides both descriptive and standardized plugin exports:

```typescript
import { i18nPlugin, plugin, PLUGIN_NAME } from "@testforgejs/vue-test-plugin-i18n";
```

### `i18nPlugin`

The descriptive Vue I18n plugin module export.

### `plugin`

The standardized plugin module export.

It references the same plugin module as `i18nPlugin` and provides a consistent package-level API across TestForge plugin packages.

### `PLUGIN_NAME`

The standardized plugin identifier export.

For this package:

```typescript
PLUGIN_NAME === "i18n";
```

The standardized `plugin` and `PLUGIN_NAME` exports are useful for tooling and other code that works with TestForge plugin packages generically.

## Supported versions

- Vue: 3.3.0 or higher
- Vue I18n: 9.x, 10.x, and 11.x

## Documentation

See the [TestForge documentation](https://github.com/testforgejs/testforge#readme).

### API Reference

See the [API reference](https://github.com/testforgejs/testforge/blob/main/packages/vue-test-plugin-i18n/docs/api/README.md).
