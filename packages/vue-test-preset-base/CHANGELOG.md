# @testforgejs/vue-test-preset-base

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
