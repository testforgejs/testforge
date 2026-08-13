# @testforgejs/vue-test-preset-recommended

Recommended presets for the [TestForge](https://github.com/testforgejs/testforge) Vue 3 component testing framework.

This package provides ready-to-use TestForge presets with sensible defaults for commonly used Vue plugins.

## Installation

Choose your preferred package manager.

### pnpm

```bash
pnpm add -D @testforgejs/vue-test-preset-recommended@beta
```

### npm

```bash
npm install -D @testforgejs/vue-test-preset-recommended@beta
```

### Yarn

```bash
yarn add -D @testforgejs/vue-test-preset-recommended@beta
```

> `@testforgejs/vue-test-core` is required.

## Quick Usage

Import the `presets` object and pass it to `createTestFramework()`:

```typescript
// tests/setup.ts
import { createTestFramework } from "@testforgejs/vue-test-core";
import { presets } from "@testforgejs/vue-test-preset-recommended";

const { testComponentFactory } = createTestFramework({
  presets,
});

export { testComponentFactory };
```

You can then use `testComponentFactory` in your component tests:

```typescript
import { describe, expect, it } from "vitest";
import { testComponentFactory } from "./setup";
import MyComponent from "./MyComponent.vue";

describe("MyComponent", () => {
  it("renders", () => {
    const factory = testComponentFactory(MyComponent);
    const wrapper = factory();

    expect(wrapper.exists()).toBe(true);
  });
});
```

## Available Presets

The package currently exports the following presets:

### `presets.default`

The default recommended preset enables the following managed plugins:

- Pinia
- Vue I18n
- Vue Router — disabled by default

It also provides default configuration for Pinia, Vue I18n, and Vue Router.

```typescript
const { testComponentFactory } = createTestFramework({
  presets: {
    default: presets.default,
  },
});
```

### `presets.i18nPreset`

A minimal preset for tests that require Vue I18n.

It enables Vue I18n with:

- Composition API mode (`legacy: false`);
- English locale;
- English fallback locale;
- empty messages;
- disabled missing-translation warnings.

```typescript
const { testComponentFactory } = createTestFramework({
  presets: {
    default: presets.i18nPreset,
  },
});
```

## Using a Preset with Other Framework Configuration

The exported presets can be combined with other TestForge configuration options:

```typescript
const { testComponentFactory } = createTestFramework({
  presets,
  shallowByDefault: true,
});
```

The preset provides the baseline plugin configuration, while individual factories and tests can override configuration when needed.

## Related Packages

- [`@testforgejs/vue-test-core`](https://www.npmjs.com/package/@testforgejs/vue-test-core) — core TestForge testing framework
- [`@testforgejs/vue-test-plugin-pinia`](https://www.npmjs.com/package/@testforgejs/vue-test-plugin-pinia) — Pinia integration
- [`@testforgejs/vue-test-plugin-i18n`](https://www.npmjs.com/package/@testforgejs/vue-test-plugin-i18n) — Vue I18n integration
- [`@testforgejs/vue-test-plugin-router`](https://www.npmjs.com/package/@testforgejs/vue-test-plugin-router) — Vue Router integration

## License

MIT
