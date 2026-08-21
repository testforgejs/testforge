# @testforgejs/vue-test-preset-base

Base presets for the [TestForge](https://github.com/testforgejs/testforge) Vue 3 component testing framework.

This package provides **runner-independent TestForge presets** with sensible defaults for commonly used Vue plugins.

The base presets are intentionally free from test-runner-specific configuration. In particular, the Pinia configuration does **not** define `createSpy`.

Runner-specific presets such as `@testforgejs/vue-test-preset-recommended` can extend these presets and provide the appropriate spy implementation for their target test runner.

## Installation

Choose your preferred package manager.

### pnpm

```bash
pnpm add -D @testforgejs/vue-test-preset-base@beta
```

### npm

```bash
npm install -D @testforgejs/vue-test-preset-base@beta
```

### Yarn

```bash
yarn add -D @testforgejs/vue-test-preset-base@beta
```

> `@testforgejs/vue-test-core` is required.

## Quick Usage

Import the `presets` object and pass it to `createTestFramework()`:

```typescript
// tests/setup.ts
import { createTestFramework } from "@testforgejs/vue-test-core";
import { presets } from "@testforgejs/vue-test-preset-base";

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

> The base preset is runner-independent. If a managed plugin requires a test-runner-specific facility such as Pinia's `createSpy`, the corresponding runner-specific preset should provide it.

## Available Presets

The package exports four presets:

- `presets.default`
- `presets.piniaPreset`
- `presets.i18nPreset`
- `presets.routerPreset`

Each preset defines an isolated managed-plugin environment.

### `presets.default`

The default base preset provides the common Vue testing environment:

- Pinia — enabled;
- Vue I18n — enabled;
- Vue Router — declared but disabled.

It also provides default configuration for all three integrations.

```typescript
const { testComponentFactory } = createTestFramework({
  presets: {
    default: presets.default,
  },
});
```

The Pinia configuration intentionally does not define `createSpy`.

For example, the base preset contains:

```typescript
{
  initialState: {},
  stubActions: false,
}
```

A runner-specific preset can extend this configuration and provide its own spy implementation.

### `presets.piniaPreset`

A minimal preset containing only the managed Pinia integration.

Pinia is enabled and uses the base Pinia defaults.

```typescript
const { testComponentFactory } = createTestFramework({
  presets: {
    default: presets.piniaPreset,
  },
});
```

This preset is useful when a test environment needs Pinia without automatically enabling the other managed integrations.

> The base `piniaPreset` is also runner-independent and does not define Pinia's `createSpy` option.

### `presets.i18nPreset`

A minimal preset containing only Vue I18n.

Vue I18n is enabled with the following defaults:

- Composition API mode (`legacy: false`);
- English locale;
- English fallback locale;
- empty messages;
- disabled missing-translation warnings;
- disabled fallback warnings.

```typescript
const { testComponentFactory } = createTestFramework({
  presets: {
    default: presets.i18nPreset,
  },
});
```

### `presets.routerPreset`

A minimal preset containing only Vue Router.

Vue Router is enabled with:

- a memory history in non-browser environments;
- a web history in browser environments;
- a minimal `/` route.

```typescript
const { testComponentFactory } = createTestFramework({
  presets: {
    default: presets.routerPreset,
  },
});
```

The router history is created by `getDefaultRouter()`, so each preset construction receives a new router configuration.

## Runner-Specific Presets

The base presets are intended to be extended by runner-specific packages.

For example, a Vitest-oriented preset can extend the base default preset and provide `vi.fn` as Pinia's `createSpy` implementation:

```typescript
import { extendPreset } from "@testforgejs/vue-test-core";
import { presets as basePresets } from "@testforgejs/vue-test-preset-base";
import { vi } from "vitest";

export const presets = {
  default: extendPreset(basePresets.default, {
    defaults: {
      pinia: {
        ...basePresets.default.defaults.pinia,
        createSpy: vi.fn,
      },
    },
  }),
};
```

The same approach can be used for the dedicated Pinia preset:

```typescript
export const presets = {
  piniaPreset: extendPreset(basePresets.piniaPreset, {
    defaults: {
      pinia: {
        ...basePresets.piniaPreset.defaults.pinia,
        createSpy: vi.fn,
      },
    },
  }),
};
```

The other base presets can be reused directly when they do not require runner-specific configuration:

```typescript
export const presets = {
  i18nPreset: basePresets.i18nPreset,
  routerPreset: basePresets.routerPreset,
};
```

This keeps runner-specific concerns outside the base package.

## Preset Selection at Runtime

A factory can switch between registered presets for an individual invocation using the fourth `extraOptions` argument:

```typescript
factory(
  {},
  {},
  {},
  {
    preset: "i18nPreset",
  },
);
```

The selected preset defines the complete managed plugin runtime for that invocation.

For example, switching to `i18nPreset` enables Vue I18n without automatically creating the Pinia or Router integrations.

## Preset Isolation

Each preset represents a complete managed-plugin runtime environment.

A plugin that is not declared in the active preset manifest cannot be configured through TestForge's managed `plugins` API.

For example, this configuration is invalid when `i18nPreset` is active:

```typescript
factory(
  {},
  {
    plugins: {
      pinia: {},
    },
  },
  {},
  {
    preset: "i18nPreset",
  },
);
```

The active preset declares only Vue I18n, so the Pinia configuration is rejected during validation.

This isolation is intentional: presets are runtime environment profiles rather than partial configuration overlays.

## Related Packages

- [`@testforgejs/vue-test-core`](https://www.npmjs.com/package/@testforgejs/vue-test-core) — core TestForge testing framework
- [`@testforgejs/vue-test-preset-recommended`](https://www.npmjs.com/package/@testforgejs/vue-test-preset-recommended) — recommended Vitest-oriented presets
- [`@testforgejs/vue-test-plugin-pinia`](https://www.npmjs.com/package/@testforgejs/vue-test-plugin-pinia) — Pinia integration
- [`@testforgejs/vue-test-plugin-i18n`](https://www.npmjs.com/package/@testforgejs/vue-test-plugin-i18n) — Vue I18n integration
- [`@testforgejs/vue-test-plugin-router`](https://www.npmjs.com/package/@testforgejs/vue-test-plugin-router) — Vue Router integration

## License

MIT
