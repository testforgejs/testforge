# @testforgejs/vue-test-plugin-primevue-v3

## 1.0.0-beta.3

### Minor Changes

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

- 396edeb: Standardize the public package contract across TestForge plugins.

  Each plugin package now exports its plugin module as `plugin` and its
  plugin identifier as `PLUGIN_NAME`, providing consistent entry points
  for consumers and tooling.

  Existing plugin-specific exports, such as `piniaPlugin`, `routerPlugin`,
  and `i18nPlugin`, remain available.

### Patch Changes

- Updated dependencies [859a79c]
  - @testforgejs/vue-test-core@1.0.0-beta.3
