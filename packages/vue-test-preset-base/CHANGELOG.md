# @testforgejs/vue-test-preset-base

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

- 859a79c: Move plugin default options from the base preset into their corresponding plugin packages.

  Plugin modules can now expose their default configuration through
  `getDefaultOptions()`, allowing presets to consume plugin-owned defaults
  instead of defining plugin-specific configuration themselves.

  `@testforgejs/vue-test-preset-base` no longer exports `defaultPinia`, `defaultI18n`, or `defaultRouter`. Consumers that relied on these exports should use the default options provided by the corresponding plugin modules.

  Recommended Jest and Vitest presets now build on plugin-owned defaults while preserving their runner-specific configuration.

### Patch Changes

- Updated dependencies [1827578]
- Updated dependencies [396edeb]
- Updated dependencies [859a79c]
  - @testforgejs/vue-test-plugin-router@1.0.0-beta.3
  - @testforgejs/vue-test-plugin-pinia@1.0.0-beta.3
  - @testforgejs/vue-test-plugin-i18n@1.0.0-beta.3
  - @testforgejs/vue-test-core@1.0.0-beta.3

## 1.0.0-beta.2

### Patch Changes

- Updated dependencies [eec595b]
- Updated dependencies [5cca4ae]
  - @testforgejs/vue-test-core@1.0.0-beta.2
  - @testforgejs/vue-test-plugin-i18n@1.0.0-beta.2
  - @testforgejs/vue-test-plugin-pinia@1.0.0-beta.2
  - @testforgejs/vue-test-plugin-router@1.0.0-beta.2

## 1.0.0-beta.1

### Major Changes

- b7dad02: feat: introduce `PluginOptionsFactory` for preset plugin defaults

  Preset plugin defaults are now defined as factory functions that return fresh plugin configuration objects instead of shared configuration objects. This prevents mutable plugin options from being shared between independent pipeline contexts.

  This is a breaking change for custom presets: existing plugin defaults defined as plain objects must be migrated to option factories.

  For example:

  Before:

  ```typescript
  defaults: {
    pinia: {
      initialState: {},
    },
  }
  ```

  After:

  ```typescript
  defaults: {
    pinia: () => ({
      initialState: {},
    }),
  }
  ```

  When extending an existing preset, the base factory must be invoked explicitly if its options should be preserved.

### Minor Changes

- 14d510b: Add a shared base preset layer and compose runner-specific recommended presets on top of it.

  The base presets provide shared Vue plugin configuration, while the recommended presets add runner-specific defaults for Vitest and Jest.

### Patch Changes

- Updated dependencies [011a3d9]
- Updated dependencies [b7dad02]
  - @testforgejs/vue-test-core@1.0.0-beta.1
  - @testforgejs/vue-test-plugin-i18n@1.0.0-beta.1
  - @testforgejs/vue-test-plugin-pinia@1.0.0-beta.1
  - @testforgejs/vue-test-plugin-router@1.0.0-beta.1
