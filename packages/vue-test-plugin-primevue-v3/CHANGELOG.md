# @testforgejs/vue-test-plugin-primevue-v3

## 1.0.0-beta.8

### Patch Changes

- Updated dependencies [def1a9c]
- Updated dependencies [4695a7a]
- Updated dependencies [a1fabd7]
- Updated dependencies [d7753f3]
  - @testforgejs/vue-test-core@1.0.0-beta.8

## 1.0.0-beta.7

### Patch Changes

- Updated dependencies [44141cc]
- Updated dependencies [c409fb5]
- Updated dependencies [6e723de]
- Updated dependencies [b5e3a01]
- Updated dependencies [259fb32]
  - @testforgejs/vue-test-core@1.0.0-beta.7

## 1.0.0-beta.6

### Minor Changes

- 5218a01: Standardize the `PluginOptions` type export across all plugin packages.

  - Expose public plugin configuration types under the consistent `PluginOptions` name.
  - Preserve existing descriptive type exports for backward compatibility.
  - Enable type-safe preset generation without plugin-specific knowledge of configuration type names.
  - Support the same package-level contract for factory-based and install-based plugins.

### Patch Changes

- Updated dependencies [d8d172f]
- Updated dependencies [88b28e0]
- Updated dependencies [5251456]
- Updated dependencies [59be31d]
  - @testforgejs/vue-test-core@1.0.0-beta.6

## 1.0.0-beta.5

### Patch Changes

- Updated dependencies
- Updated dependencies [3d72817]
- Updated dependencies [b93acc9]
  - @testforgejs/vue-test-core@1.0.0-beta.5

## 1.0.0-beta.4

### Patch Changes

- Updated dependencies [ce97ea4]
- Updated dependencies [cfd229f]
  - @testforgejs/vue-test-core@1.0.0-beta.4

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
