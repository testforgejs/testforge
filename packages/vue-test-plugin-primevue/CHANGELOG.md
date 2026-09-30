# @testforgejs/vue-test-plugin-primevue

## 1.0.0-beta.3

### Major Changes

- 0bf7727: Add PrimeVue 5 support and split PrimeVue integrations by supported major versions.

  `@testforgejs/vue-test-plugin-primevue` now supports PrimeVue 4 and 5. PrimeVue 3 support has moved to the new `@testforgejs/vue-test-plugin-primevue-v3` package.

  PrimeVue 3 users must replace:

  ```typescript
  import { primeVuePlugin } from "@testforgejs/vue-test-plugin-primevue";
  ```

  with:

  ```typescript
  import { primeVuePlugin } from "@testforgejs/vue-test-plugin-primevue-v3";
  ```

  The PrimeVue 3 integration uses the `primevueV3` configuration key instead of `primevue` to keep its type augmentation separate from the PrimeVue 4 and 5 integration.

  For PrimeVue 3 configurations, replace:

  ```typescript
  plugins: {
    primevue: {
      // ...
    },
  }
  ```

  with:

  ```typescript
  plugins: {
    primevueV3: {
      // ...
    },
  }
  ```

### Minor Changes

- 396edeb: Standardize the public package contract across TestForge plugins.

  Each plugin package now exports its plugin module as `plugin` and its
  plugin identifier as `PLUGIN_NAME`, providing consistent entry points
  for consumers and tooling.

  Existing plugin-specific exports, such as `piniaPlugin`, `routerPlugin`,
  and `i18nPlugin`, remain available.

- 859a79c: Move plugin default options from the base preset into their corresponding plugin packages.

  Plugin modules can now expose their default configuration through
  `getDefaultOptions()`, allowing presets to consume plugin-owned defaults
  instead of defining plugin-specific configuration themselves.

  `@testforgejs/vue-test-preset-base` no longer exports `defaultPinia`, `defaultI18n`, or `defaultRouter`. Consumers that relied on these exports should use the default options provided by the corresponding plugin modules.

  Recommended Jest and Vitest presets now build on plugin-owned defaults while preserving their runner-specific configuration.

### Patch Changes

- Updated dependencies [859a79c]
  - @testforgejs/vue-test-core@1.0.0-beta.3

## 1.0.0-beta.2

### Patch Changes

- Updated dependencies [eec595b]
- Updated dependencies [5cca4ae]
  - @testforgejs/vue-test-core@1.0.0-beta.2

## 1.0.0-beta.1

### Patch Changes

- Updated dependencies [011a3d9]
- Updated dependencies [b7dad02]
  - @testforgejs/vue-test-core@1.0.0-beta.1

## 1.0.0-beta.0

### Minor Changes

- 15fec23: feat: added initial support for PrimeVue integration via `@testforgejs/vue-test-plugin-primevue`

  The plugin supports install-based Vue plugins by producing
  Vue Test Utils compatible plugin tuples:

  ```ts
  plugins: {
    primevue: {
      ripple: true,
    },
  }
  ```

  This implementation also serves as a reference example for
  non-instance Vue plugin integrations within TestForge.

### Patch Changes

- Updated dependencies [fc3f261]
- Updated dependencies [20594ee]
- Updated dependencies [dd54f06]
- Updated dependencies [52cafb3]
- Updated dependencies [8aeb567]
- Updated dependencies [4bf0863]
- Updated dependencies [9599a20]
- Updated dependencies [20bdf32]
- Updated dependencies [473166b]
- Updated dependencies [76c34ea]
- Updated dependencies [8753cc3]
- Updated dependencies [caa4462]
- Updated dependencies [c25c14e]
- Updated dependencies [f207c89]
- Updated dependencies [832cbd8]
- Updated dependencies [10aba51]
- Updated dependencies [ec14081]
- Updated dependencies [4490644]
- Updated dependencies [b432719]
- Updated dependencies [1a20fb3]
- Updated dependencies [be65af3]
- Updated dependencies [f32378c]
- Updated dependencies [d420388]
- Updated dependencies [40b3b25]
- Updated dependencies [6c2d7b5]
- Updated dependencies [e4e4934]
  - @testforgejs/vue-test-core@1.0.0-beta.0
