# @testforgejs/vue-test-plugin-pinia

## 1.0.0-beta.9

### Patch Changes

- Updated dependencies [def1a9c]
- Updated dependencies [4695a7a]
- Updated dependencies [a1fabd7]
- Updated dependencies [d7753f3]
  - @testforgejs/vue-test-core@1.0.0-beta.8

## 1.0.0-beta.8

### Patch Changes

- Updated dependencies [44141cc]
- Updated dependencies [c409fb5]
- Updated dependencies [6e723de]
- Updated dependencies [b5e3a01]
- Updated dependencies [259fb32]
  - @testforgejs/vue-test-core@1.0.0-beta.7

## 1.0.0-beta.7

### Major Changes

- 75fd941: Replace the legacy string-keyed `mockStores` option with the symbol-based `withMockStores()` helper.

  **Breaking change:** The `mockStores` option is no longer supported. Use `withMockStores(callback)` instead.

  The new helper uses an internal symbol-keyed property to configure store initialization without conflicting with native `@pinia/testing` options.

  The internal callback is extracted before passing configuration to the native Pinia factory, ensuring that only supported native options are forwarded.

  The callback continues to run after the Pinia instance has been resolved and before the component is mounted, including when an existing instance is reused through `__meta.instance`.

  **Migration example:**

  Before:

  ```ts
  factory({}, {
    plugins: {
      pinia: {
        stubActions: false,
        mockStores: (pinia) => {
          const store = useCounterStore(pinia);
          store.count = 42;
        },
      },
    },
  });

  After:

  import { withMockStores } from "@testforgejs/vue-test-plugin-pinia";

  factory({}, {
    plugins: {
      pinia: {
        stubActions: false,
        ...withMockStores((pinia) => {
          const store = useCounterStore(pinia);
          store.count = 42;
        }),
      },
    },
  });

  The `withMockStores()` helper supports both newly created and explicitly reused Pinia instances. Existing instance reuse behavior remains unchanged.

  ```

### Minor Changes

- d8d172f: Refine managed plugin instance typing and capabilities.

  - Use `PluginInstanceMap` as the source of truth for managed instance support.
  - Restrict `captureInstance()` and `withPluginInstance()` to plugins registered in `PluginInstanceMap`.
  - Preserve type-safe instance capturing and reuse through registered instance types.
  - Explicitly reject instance controls for install-based plugins without managed instances.
  - Separate public plugin configuration types from internal runtime instance controls.
  - Introduce dedicated runtime options for Pinia, Router, I18n, and Vuetify.
  - Expand type tests covering supported, unsupported, and incompatible plugin instances.

  - **BREAKING (TypeScript):** Remove the `PluginControlOptions`
    export. Managed instance controls are now provided automatically
    for plugins registered in `PluginInstanceMap`.

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

## 1.0.0-beta.6

### Minor Changes

- f77204f: Change `VueTestPiniaOptions` from an interface to a type alias.

  The new definition combines `TestingOptions`, `PluginControlOptions<TestingPinia>`, and the TestForge-specific `mockStores` option using an intersection type.

  Existing plugin configuration and runtime behavior remain unchanged.

  **TypeScript compatibility:** Declaration merging is no longer supported for `VueTestPiniaOptions`. Consumers augmenting this interface must migrate to explicit type extensions or intersections.

### Patch Changes

- Updated dependencies
- Updated dependencies [3d72817]
- Updated dependencies [b93acc9]
  - @testforgejs/vue-test-core@1.0.0-beta.5

## 1.0.0-beta.5

### Minor Changes

- ce97ea4: Add support for managed plugin instance dependencies.

  - Introduce `fromPluginInstance()` for referencing runtime instances of managed plugins.
  - Resolve nested instance references in dependency order, independently of manifest order.
  - Detect invalid and circular plugin dependencies.
  - Preserve instance isolation across component mounts.
  - Register runtime instance types for supported plugins, enabling type-safe dependency resolution.

### Patch Changes

- cfd229f: Add runtime capability metadata for plugin instance references.

  `PluginDefinition` now supports the optional `supportsInstanceReferences` flag, allowing TestForge to distinguish plugins that expose addressable runtime instances from install-based plugins.

  Instance-based I18n, Pinia, Router, and Vuetify integrations now declare this capability.

- Updated dependencies [ce97ea4]
- Updated dependencies [cfd229f]
  - @testforgejs/vue-test-core@1.0.0-beta.4

## 1.0.0-beta.4

### Patch Changes

- f33f94a: Use `TestingPinia` as the Pinia plugin runtime instance type, accurately reflecting the instance returned by `createTestingPinia` and exposing its testing-specific properties to TypeScript consumers.

## 1.0.0-beta.3

### Major Changes

- 1827578: Redesign plugin default options around minimal, project-independent integration baselines.

  Plugin defaults now avoid application-specific policy and preserve upstream library behavior unless TestForge needs to override it for reliable or consistent integration.

  ### Pinia

  Pinia defaults no longer set `initialState: {}` or `stubActions: false`.

  The plugin now only provides runner integration through `createSpy` when a test runner is supplied. As a result, `@pinia/testing` defaults are preserved, including stubbing actions by default.

  Projects that rely on real action execution should configure it explicitly:

  ```typescript
  pinia: () => ({
    stubActions: false,
    createSpy: vi.fn,
  });
  ```

  ### Vue Router

  Router defaults now always use `createMemoryHistory()` and an empty route table.

  TestForge no longer selects browser history based on the presence of `window` and no longer creates a synthetic `/` route.

  Projects that depend on application routes or browser history should provide them explicitly in their preset.

  ### Vue I18n

  Vue I18n defaults now contain only:

  ```typescript
  {
    legacy: false,
    globalInjection: true,
  }
  ```

  TestForge no longer selects an application locale or fallback locale, provides an empty message catalog explicitly, or suppresses missing/fallback warnings.

  Projects that depend on specific locales, messages, fallback behavior, or warning policy should configure those options explicitly.

  These changes also affect the base, recommended, and recommended-jest presets because they explicitly consume the plugin-provided defaults.

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

- f177d3a: feat: migrated `@testforgejs/vue-test-plugin-pinia` to TypeScript.

  The package now provides stronger typings for plugin options and Pinia instances, and fully supports the new generic plugin runtime system introduced in `@testforgejs/vue-test-core`.

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

## 0.1.0

### Minor Changes

- init: setup monorepo and initial package structure
