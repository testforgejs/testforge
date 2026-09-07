# @testforgejs/vue-test-preset-recommended

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
- Updated dependencies [14d510b]
- Updated dependencies [b7dad02]
  - @testforgejs/vue-test-core@1.0.0-beta.1
  - @testforgejs/vue-test-preset-base@1.0.0-beta.1
  - @testforgejs/vue-test-plugin-i18n@1.0.0-beta.1
  - @testforgejs/vue-test-plugin-pinia@1.0.0-beta.1
  - @testforgejs/vue-test-plugin-router@1.0.0-beta.1

## 1.0.0-beta.0

### Patch Changes

- Updated dependencies [fc3f261]
- Updated dependencies [20594ee]
- Updated dependencies [dd54f06]
- Updated dependencies [52cafb3]
- Updated dependencies [8aeb567]
- Updated dependencies [4bf0863]
- Updated dependencies [9599a20]
- Updated dependencies [f177d3a]
- Updated dependencies [20bdf32]
- Updated dependencies [473166b]
- Updated dependencies [76c34ea]
- Updated dependencies [8753cc3]
- Updated dependencies [caa4462]
- Updated dependencies [c25c14e]
- Updated dependencies [f207c89]
- Updated dependencies [832cbd8]
- Updated dependencies [ef8afca]
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
  - @testforgejs/vue-test-plugin-pinia@1.0.0-beta.0
  - @testforgejs/vue-test-plugin-i18n@1.0.0-beta.0
  - @testforgejs/vue-test-plugin-router@1.0.0-beta.0

## 0.1.0

### Minor Changes

- init: setup monorepo and initial package structure

### Patch Changes

- Updated dependencies
  - @testforgejs/vue-test-plugin-i18n@0.1.0
  - @testforgejs/vue-test-plugin-pinia@0.1.0
  - @testforgejs/vue-test-plugin-router@0.1.0
