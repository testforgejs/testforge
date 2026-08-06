# @testforgejs/vue-test-core

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
