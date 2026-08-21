# @testforgejs/vue-test-preset-recommended-jest

Recommended **Jest** presets for the [TestForge](https://github.com/testforgejs/testforge) Vue 3 component testing framework.

This package builds on [`@testforgejs/vue-test-preset-base`](https://www.npmjs.com/package/@testforgejs/vue-test-preset-base) and provides recommended defaults for projects using **Jest**.

The main difference from the base presets is the Pinia configuration: the recommended presets configure Pinia to use Jest's `jest.fn` as its spy factory.

## Installation

Choose your preferred package manager.

### pnpm

```bash
pnpm add -D @testforgejs/vue-test-preset-recommended-jest@beta
```

### npm

```bash
npm install -D @testforgejs/vue-test-preset-recommended-jest@beta
```

### Yarn

```bash
yarn add -D @testforgejs/vue-test-preset-recommended-jest@beta
```

> `@testforgejs/vue-test-core` and `@testforgejs/vue-test-preset-base` are required dependencies.

## Quick Usage

Import the `presets` object and pass it to `createTestFramework()`:

```typescript
// tests/setup.ts
import { createTestFramework } from "@testforgejs/vue-test-core";
import { presets } from "@testforgejs/vue-test-preset-recommended-jest";

const { testComponentFactory } = createTestFramework({
  presets,
});

export { testComponentFactory };
```

You can then use `testComponentFactory` in your component tests:

```typescript
import { describe, expect, it } from "@jest/globals";
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

The package exports four presets:

- `presets.default`
- `presets.piniaPreset`
- `presets.i18nPreset`
- `presets.routerPreset`

The presets are based on the corresponding presets from `@testforgejs/vue-test-preset-base`.

### `presets.default`

The default recommended Jest preset enables:

- Pinia
- Vue I18n
- Vue Router — disabled by default

It also provides the default configuration for these plugins.

For Pinia, the recommended preset additionally configures Jest's `jest.fn` as the `createSpy` implementation.

```typescript
const { testComponentFactory } = createTestFramework({
  presets: {
    default: presets.default,
  },
});
```

This is the preset intended for most Jest-based TestForge projects.

### `presets.piniaPreset`

A minimal preset for tests that require Pinia.

It enables Pinia and configures its spy factory to use Jest:

```typescript
const { testComponentFactory } = createTestFramework({
  presets: {
    default: presets.piniaPreset,
  },
});
```

The Pinia configuration is based on the base preset and adds:

```typescript
{
  createSpy: jest.fn,
}
```

This makes the preset immediately usable with `@pinia/testing` under Jest.

### `presets.i18nPreset`

A minimal preset for tests that require Vue I18n.

It enables Vue I18n using the base preset's default configuration:

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

### `presets.routerPreset`

A minimal preset for tests that require Vue Router.

It enables the managed Vue Router integration using the base preset's default router configuration.

```typescript
const { testComponentFactory } = createTestFramework({
  presets: {
    default: presets.routerPreset,
  },
});
```

The router preset provides a test-oriented router configuration suitable for isolated component tests.

## Recommended vs Base Presets

`@testforgejs/vue-test-preset-base` provides runner-neutral preset definitions.

`@testforgejs/vue-test-preset-recommended-jest` builds on those presets and adds Jest-specific configuration where necessary.

In particular:

```text
@testforgejs/vue-test-preset-base
        │
        ├── default
        ├── piniaPreset
        ├── i18nPreset
        └── routerPreset
                │
                ▼
@testforgejs/vue-test-preset-recommended-jest
        │
        ├── default       → adds Jest jest.fn to Pinia
        ├── piniaPreset   → adds Jest jest.fn to Pinia
        ├── i18nPreset    → inherited from base
        └── routerPreset  → inherited from base
```

This separation keeps the base preset independent from a particular test runner while allowing the recommended preset to provide runner-specific defaults.

## Switching Presets at Runtime

A preset can be selected for an individual factory invocation using the fourth `extraOptions` argument:

```typescript
const factory = testComponentFactory(MyComponent);

factory(
  {},
  {},
  {},
  {
    preset: "i18nPreset",
  },
);
```

This allows the same test framework to use different runtime environments without creating a separate framework instance.

For example:

```typescript
factory(
  {},
  {},
  {},
  {
    preset: "piniaPreset",
  },
);
```

selects the Pinia-only runtime environment for that invocation.

## Customizing Presets

The recommended presets are ordinary TestForge preset definitions and can be composed with [`extendPreset()`](https://github.com/testforgejs/testforge).

For example, a project can create its own preset from the recommended default:

```typescript
import { extendPreset } from "@testforgejs/vue-test-core";
import { presets as recommendedPresets } from "@testforgejs/vue-test-preset-recommended-jest";

const projectPresets = {
  default: extendPreset(recommendedPresets.default, {
    defaults: {
      pinia: {
        ...recommendedPresets.default.defaults.pinia,
        // project-specific options
      },
    },
  }),
};
```

When extending a preset, explicitly preserve any base plugin options that should remain enabled. Managed plugin configuration is intentionally replaced when an extension provides configuration for that plugin.

For details about preset composition and configuration layering, see the [TestForge core documentation](https://github.com/testforgejs/testforge/blob/main/packages/vue-test-core/README.md).

## Using a Preset with Other Framework Configuration

The exported presets can be combined with other TestForge configuration options:

```typescript
const { testComponentFactory } = createTestFramework({
  presets,
  shallowByDefault: true,
});
```

The preset provides the runtime plugin baseline, while individual factories and tests can override configuration when needed.

## Related Packages

- [`@testforgejs/vue-test-core`](https://www.npmjs.com/package/@testforgejs/vue-test-core) — TestForge core framework
- [`@testforgejs/vue-test-preset-base`](https://www.npmjs.com/package/@testforgejs/vue-test-preset-base) — base, runner-neutral presets
- [`@testforgejs/vue-test-preset-recommended`](https://www.npmjs.com/package/@testforgejs/vue-test-preset-recommended) — recommended Vitest presets
- [`@testforgejs/vue-test-plugin-pinia`](https://www.npmjs.com/package/@testforgejs/vue-test-plugin-pinia) — Pinia integration
- [`@testforgejs/vue-test-plugin-i18n`](https://www.npmjs.com/package/@testforgejs/vue-test-plugin-i18n) — Vue I18n integration
- [`@testforgejs/vue-test-plugin-router`](https://www.npmjs.com/package/@testforgejs/vue-test-plugin-router) — Vue Router integration

## License

MIT
