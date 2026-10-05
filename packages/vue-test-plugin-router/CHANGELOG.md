# @testforgejs/vue-test-plugin-router

## 1.0.0-beta.4

### Patch Changes

- 9cfd3a2: Represent Router and Vuetify plugin options as intersection type aliases instead of interfaces, preserving their configuration shape while producing cleaner generated API documentation.

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

### Patch Changes

- ef8afca: fix: add missing export for `routerPlugin` in entry point
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

### Patch Changes

- Updated dependencies
  - @testforgejs/vue-test-core@0.1.0
