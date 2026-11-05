# @testforgejs/vue-test-core

## 1.0.0-beta.7

### Major Changes

- c409fb5: **BREAKING CHANGE:** Rename `extraOptions.preset` to `extraOptions.presetKey`.

  The new name explicitly identifies a preset by its key in the
  preset registry, distinguishing preset selection from the
  `PresetDefinition` supplied to `createTestFramework()`.

  Replace:

  ```ts
  factory(
    {},
    {},
    {},
    {
      preset: "admin",
    },
  );
  ```

  with:

  ```ts
  factory(
    {},
    {},
    {},
    {
      presetKey: "admin",
    },
  );
  ```

  The `preset` and `presets` options in `createTestFramework()` remain unchanged.

### Minor Changes

- 44141cc: Add an optional `ComponentFactoryConfig` parameter to the positional `testComponentFactory()` API.

  The fifth argument allows selecting a factory-level preset using `config.presetKey` without migrating existing tests to `testComponentFactory.withOptions()`.

  The selected preset applies to all mounts created by the factory unless overridden by `extraOptions.presetKey` for an individual mount.

  Factory configuration is validated at creation time, including the configuration object shape and the selected preset key.

  The existing positional arguments and their behavior remain unchanged.

- b5e3a01: Add `testComponentFactory.withOptions()` for object-based component factory configuration.

  The new API supports:

  - Configuring `component`, `defaultProps`, `defaultMountOptions`, and `defaultSlots` through a single options object.
  - Selecting a factory-level preset using `presetKey`.
  - Overriding the factory preset per mount using `extraOptions.presetKey`, without affecting subsequent mounts.
  - Validating factory creation options and preset keys at runtime.
  - Validating `defaultMountOptions` against the selected factory preset.

  The existing positional `testComponentFactory()` API remains unchanged.

- 259fb32: Add an object-based component mounting API through `factory.withOptions()`.

  The new API accepts named `props`, `mountOptions`, `slots`, and `extraOptions` fields as an alternative to positional arguments.

  Both invocation styles share the same configuration resolution pipeline, preset selection, plugin lifecycle, and TypeScript inference. Existing positional calls remain fully supported.

### Patch Changes

- 6e723de: Improve plugin option validation for factory-level and mount-level preset selection.

  - Validate `defaultMountOptions.plugins` against the explicitly selected factory-level preset during factory creation.
  - Validate mount arguments using the effective preset, respecting mount-level overrides via `extraOptions.presetKey`.
  - Preserve existing behavior when switching presets per mount, allowing unsupported default plugins to be filtered out without errors.
  - Reuse the shared plugin compatibility validator for consistent validation rules and error messages.

## 1.0.0-beta.6

### Major Changes

- 88b28e0: **BREAKING CHANGE:** Replace string-keyed `__meta.instance` with the `withPluginInstance()` helper for reusing pre-created plugin instances.

  Plugin instance metadata now uses an internal `Symbol` key instead of the reserved `__meta` property, preventing collisions with native plugin configuration options.

  To migrate, replace:

  ```ts
  plugins: {
    pinia: {
      __meta: {
        instance: existingPinia,
      },
    },
  }
  ```

  with:

  ```ts
  import { withPluginInstance } from "@testforgejs/vue-test-core";

  plugins: {
    pinia: {
      ...withPluginInstance(existingPinia),
    },
  }
  ```

  The `withPluginInstance()` helper requires a pre-created plugin instance and cannot accept deferred references created by `fromPluginInstance()`.

  Existing integrations with `captureInstance()` and plugin-specific helpers such as Pinia's `withMockStores()` remain supported.

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

- 59be31d: Extend `withPluginInstance()` support to `defaultMountOptions.plugins` and `mountOptions.plugins`, in addition to `extraOptions.plugins`.

  Pre-created plugin instances can now be shared across mounts through factory defaults or overridden for individual mounts. Instance metadata is resolved from the effective plugin configuration while preserving existing configuration precedence and isolation between pipeline runs.

### Patch Changes

- 5251456: Fix plugin disabling via `extraOptions.plugins` by correctly applying explicit `false` overrides to the runtime plugin state.

  Ensure disabled plugins remain disabled throughout subsequent pipeline stages.

## 1.0.0-beta.5

### Major Changes

- 3d72817: Replace the legacy `expose` option with symbol-based plugin instance capturing.

  **Breaking change:** The `expose` option is no longer supported for capturing managed plugin instances. Use `captureInstance<T>()` instead.

  The `captureInstance()` helper now uses an internal symbol-keyed callback, preventing conflicts with native plugin options. Its `instance` getter is non-enumerable and is not copied when spreading capture options into plugin configuration.

  Internal instance capture and shared-instance options are excluded from the options passed to native plugin factories. Native plugin options, including an `expose` option if supported by the underlying library, are preserved.

  **Migration example:**

  Before:

  ```ts
  let piniaInstance;

  factory(
    {},
    {
      plugins: {
        pinia: {
          expose(instance) {
            piniaInstance = instance;
          },
        },
      },
    },
  );
  ```

  After:

  ````ts
  import { captureInstance } from "@testforgejs/vue-test-core";
  import type { Pinia } from "pinia";

  const piniaCapture = captureInstance<Pinia>();

  factory({}, {
    plugins: {
      pinia: {
        ...piniaCapture,
      },
    },
  });

  const piniaInstance = piniaCapture.instance;
  ```# An empty message aborts the editor.

  ````

### Patch Changes

- Disallow `captureInstance()` in `defaultMountOptions` to prevent shared instance captures across component mounts.

  Add runtime validation that rejects instance capture in factory-level plugin defaults, even when the configuration is overridden by `mountOptions` or skipped via `skipDefaultOptions`.

  Instance capture remains supported in per-mount `mountOptions` and `extraOptions`.

- b93acc9: Replace the internal `__sharedInstance` string key with a unique symbol to prevent collisions with native plugin configuration options.

  Update runtime configuration handling to preserve enumerable symbol-keyed properties while keeping shared plugin instances opaque during dependency collection and reference resolution.

  No changes to the public API or existing plugin instance management behavior.

## 1.0.0-beta.4

### Minor Changes

- ce97ea4: Add support for managed plugin instance dependencies.

  - Introduce `fromPluginInstance()` for referencing runtime instances of managed plugins.
  - Resolve nested instance references in dependency order, independently of manifest order.
  - Detect invalid and circular plugin dependencies.
  - Preserve instance isolation across component mounts.
  - Register runtime instance types for supported plugins, enabling type-safe dependency resolution.

- cfd229f: Add runtime capability metadata for plugin instance references.

  `PluginDefinition` now supports the optional `supportsInstanceReferences` flag, allowing TestForge to distinguish plugins that expose addressable runtime instances from install-based plugins.

  Instance-based I18n, Pinia, Router, and Vuetify integrations now declare this capability.

## 1.0.0-beta.3

### Minor Changes

- 859a79c: Move plugin default options from the base preset into their corresponding plugin packages.

  Plugin modules can now expose their default configuration through
  `getDefaultOptions()`, allowing presets to consume plugin-owned defaults
  instead of defining plugin-specific configuration themselves.

  `@testforgejs/vue-test-preset-base` no longer exports `defaultPinia`, `defaultI18n`, or `defaultRouter`. Consumers that relied on these exports should use the default options provided by the corresponding plugin modules.

  Recommended Jest and Vitest presets now build on plugin-owned defaults while preserving their runner-specific configuration.

## 1.0.0-beta.2

### Minor Changes

- 5cca4ae: Add mutually exclusive `preset` and `presets` options to `createTestFramework()`.

  Presets can now be provided either as a single runtime environment or as a named preset registry. When using a preset registry, `extraOptions.preset` selects the runtime environment for a factory invocation.

  Expose the public `CreateTestFrameworkOptions`, `PresetExtension`, and `PluginManifestEntry` types for preset configuration and composition.

### Patch Changes

- eec595b: Fix the `validatePreset` API to correctly type preset names as strings.

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

- 011a3d9: feat: add `extendPreset` for creating project-specific presets from existing preset definitions.

  Preset extensions can override plugin configuration and manifest entries while preserving the base preset configuration. Extension validation also ensures that newly added plugins declare both their `enabled` state and default configuration, and prevents invalid or unknown plugin defaults.

## 1.0.0-beta.0

### Major Changes

- caa4462: fix: validate `extraOptions.plugins` against the active preset plugin whitelist

  Previously, unsupported plugins passed through `extraOptions.plugins` without validation.
  Now the framework throws an error when a plugin is configured that is not supported by the active preset.

  Example:

  ```js
  extraOptions: {
    plugins: {
      vuetify: {
      }
    }
  }
  ```

- c25c14e: feat: move plugin overrides under `extraOptions.plugins`.

  Before:

  ```ts
  {
    pinia: false,
  }
  ```

  After:

  ```ts
  {
    plugins: {
      pinia: false,
    },
  }
  ```

  Plugin overrides are now separated from framework-level extra options to prevent naming collisions and make the configuration structure explicit.

- f207c89: feat: replace the custom `useShallow` option with the standard Vue Test Utils `shallow` option.

  `ComponentFactoryOptions` now relies on the inherited `shallow` property from VTU's `MountingOptions`. Existing usages of:

  ```js
  factory(
    {},
    {
      useShallow: false,
    },
  );
  ```

  should be updated to:

  ```js
  factory(
    {},
    {
      shallow: false,
    },
  );
  ```

  Add shallowByDefault framework option.

- 1a20fb3: feat: removed support for `false` values in preset plugin defaults.

  Preset `defaults` entries must now always contain configuration objects. Plugin disabling should be handled through the preset manifest or runtime plugin options instead.

  This change simplifies the plugin configuration model and aligns runtime validation with the `PluginConfig` architecture.

### Minor Changes

- fc3f261: feat: added runtime validation for component factory invocation arguments

  Added third-level runtime validation for component factory calls.

  Arguments passed to `factory(props, mountOptions, slots, extraOptions)` are now validated before mount execution.

  Invalid objects and invalid boolean flags produce descriptive errors, improving debugging and making runtime behavior more predictable.

- 20594ee: feat: added runtime validation for `testComponentFactory()` arguments

  `component`, `defaultProps`, `defaultMountOptions`, and `defaultSlots` are now validated and throw descriptive errors when invalid values are provided.

- 52cafb3: feat: introduce type-safe `mergeRecord` for pipeline result state
- 8aeb567: feat: add typed slot support for component factories

  Slot names and scoped slot props are now inferred from the
  component type.

  Unlike Vue's native `Slot` type, TestForge intentionally
  relaxes slot return types to make test doubles easier to
  write. Simple string-based slot mocks are supported while
  preserving type safety for scoped slot props and rejecting
  unknown slot names.

  Added type-level coverage for all slot entry points,
  including factory defaults, mount options and per-test
  overrides.

- 4bf0863: feat: expose public API TypeScript types via `index.ts` entry point
- 9599a20: feat: improved plugin typing by introducing the `MountPlugin` abstraction

  `PluginDefinition`, `PluginModule`, and `PluginManifestEntry` now constrain plugin instances to Vue Test Utils compatible plugin entries, including both plain Vue plugins and tuple-style plugin registrations (`[plugin, options]`).

  This change improves type safety for future plugin integrations such as Vuetify and other installable Vue plugins.

- 20bdf32: fix: refactored plugin typing architecture.

  Plugin generics were reordered from `<TOptions, TInstance>` to `<TInstance, TOptions>` for improved readability and API ergonomics.

  Plugin definitions are no longer constrained to Vue `Plugin` instances from `@vue/runtime-core`. This allows the plugin system to support arbitrary runtime instances and removes unnecessary coupling to Vue internals.

  This change improves TypeScript inference and makes custom plugin development more flexible.

- 473166b: feat: added support for install-based Vue plugins through the new `createVuePlugin()` helper

  This allows TestForge plugins to integrate Vue plugins implemented as:
  - install objects (`{ install(app) {} }`)
  - install functions (`(app) => {}`)

  Examples include PrimeVue and similar libraries that do not expose stateful runtime instances.

  Unlike `createPluginInstance()`, install-based plugins do not support `__meta.instance` reuse or `expose()` callbacks because they do not produce runtime instances.

- 8753cc3: feat: export TestFramework from the public API.

  Consumers can now import and use the TestFramework type directly when typing framework instances created by createTestFramework().

  This change affects TypeScript typings only and does not modify runtime behavior.

- 832cbd8: fix: improve TypeScript support for `testComponentFactory()` by inferring prop types from Vue component definitions

  This enables automatic validation of:
  - factory default props
  - per-test props
  - `defaultMountOptions.props`
  - `mountOptions.props`

  Unknown prop names and invalid prop value types are now detected at compile time, providing stronger type safety and better editor autocompletion.

- ec14081: feat: add type guards `assertIsObject` and `assertPluginValue`
- b432719: feat: exported `ComponentFactoryCreator` as part of the public TypeScript API

  This type represents the `testComponentFactory` contract and can be used by consumers to type reusable factory references, wrappers, and custom helpers built on top of TestForge.

- f32378c: feat: add type-safe support for component data overrides

  Component state overrides are now inferred from the component definition.

  TestForge validates the return value of `data()` in factory options and reports:
  - unknown state properties;
  - incompatible value types;
  - invalid literal union values.

  The implementation preserves Vue Test Utils behavior and typing semantics to keep migration straightforward.

  This release introduces:
  - `ComponentDataInput<T>`;
  - typed `data()` support in `ComponentFactoryOptions`;
  - automatic propagation of data types through `testComponentFactory()`;
  - additional tsd coverage for component state validation.

- d420388: feat: added runtime validation for `createTestFramework()` options

  Invalid framework options are now detected during initialization with descriptive error messages. This includes validation of:
  - plain object options;
  - `shallowByDefault`;
  - preset collections;
  - preset manifests and plugin defaults.

  Also added runtime and type-level tests for the guard and assertion utilities used by the validation layer.

- 40b3b25: feat: add plugin-aware validation and DX warnings for factory configuration objects

  TestForge now detects managed plugin options placed at the root level of:
  - `defaultMountOptions`
  - `mountOptions`
  - `extraOptions`

  and suggests moving them under `plugins.<pluginName>`.

  Plugin validation is preset-aware and includes improved warning messages with configuration context.

- 6c2d7b5: feat: introduce central TypeScript type definitions as part of the initial migration groundwork

### Patch Changes

- dd54f06: fix: improve runtime validation when merging configuration objects.

  `mergeConfigs()` now rejects invalid inputs instead of silently accepting values such as `null`, numbers, or strings. This prevents malformed `mountOptions.global` values from propagating through the pipeline and surfaces configuration errors earlier with clearer error messages.

- 76c34ea: fix: generate consistent TypeScript imports
- 10aba51: fix: merge attrs instead of replacing default attrs

  Fixed `attrs` handling in `testComponentFactory`.

  Previously, `mountOptions.attrs` replaced `defaultMountOptions.attrs` entirely. Now both objects are shallow-merged, following the same behavior used for `props`, `slots`, and other mount configuration options.

  Priority order:
  - `mountOptions.attrs`
  - `defaultMountOptions.attrs`

  The `skipDefaultOptions` flag continues to disable default attrs.

- 4490644: fix: correct `tsup --watch` command in package scripts
- be65af3: fix: prevent global mutation and correctly merge `plugins` in `mountWithPlugins`
- e4e4934: fix: fixed an issue where switching presets at runtime could fail if `defaultMountOptions.plugins`

  Default plugin configuration is now filtered by the active preset before entering
  the runtime plugin pipeline, allowing factories to define plugin defaults for the
  main preset while safely switching to narrower presets in individual tests.

## 0.1.0

### Minor Changes

- init: setup monorepo and initial package structure
