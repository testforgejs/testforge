# @testforgejs/vue-test-plugin-vuetify

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

- 9cfd3a2: Represent Router and Vuetify plugin options as intersection type aliases instead of interfaces, preserving their configuration shape while producing cleaner generated API documentation.

## 1.0.0-beta.3

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

- 67489d6: feat: add initial Vuetify plugin implementation for TestForge

  Features included in the initial release:
  - automatic integration with `createVuetify()`
  - support for `VuetifyOptions`
  - `PluginControlOptions` support including `expose()`
  - module augmentation for `PluginOptionsMap`
  - full compatibility with the TestForge plugin pipeline

  The plugin currently targets Vuetify 3 and is expected to remain compatible with future Vuetify 4 releases that continue to expose the `createVuetify()` factory API.

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
