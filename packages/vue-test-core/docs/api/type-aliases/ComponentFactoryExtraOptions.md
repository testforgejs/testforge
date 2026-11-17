[**@testforgejs/vue-test-core**](../README.md)

***

> **ComponentFactoryExtraOptions** = `object`

Defined in: [packages/vue-test-core/src/types.ts:1008](https://github.com/testforgejs/testforge/blob/445a1dda5af6e9fa30f2b4c58bbec4097a4a4e7a/packages/vue-test-core/src/types.ts#L1008)

Per-mount controls for preset selection, factory defaults, and managed plugins.

Passed as the fourth argument to `factory()` or as `extraOptions`
in `factory.withOptions()`.

These options apply only to the current mount and do not modify
the component factory's default configuration.

## Properties

### plugins?

> `optional` **plugins?**: [`PluginOverridesInput`](PluginOverridesInput.md)

Defined in: [packages/vue-test-core/src/types.ts:1057](https://github.com/testforgejs/testforge/blob/445a1dda5af6e9fa30f2b4c58bbec4097a4a4e7a/packages/vue-test-core/src/types.ts#L1057)

Per-mount overrides for managed plugin configuration.

Applies a shallow overlay to the resolved runtime options of each
specified plugin. Set a plugin entry to `false` to disable it.

Unlike `mountOptions.plugins`, which replaces the factory-level
configuration for a plugin, these overrides preserve unspecified
top-level options.

***

### presetKey?

> `optional` **presetKey?**: `PresetKey`

Defined in: [packages/vue-test-core/src/types.ts:1015](https://github.com/testforgejs/testforge/blob/445a1dda5af6e9fa30f2b4c58bbec4097a4a4e7a/packages/vue-test-core/src/types.ts#L1015)

Preset key to use for this mount.

Overrides the factory-level `presetKey`. When omitted, the factory's
preset selection or the framework's default resolution applies.

***

### skipDefaultOptions?

> `optional` **skipDefaultOptions?**: `boolean`

Defined in: [packages/vue-test-core/src/types.ts:1045](https://github.com/testforgejs/testforge/blob/445a1dda5af6e9fa30f2b4c58bbec4097a4a4e7a/packages/vue-test-core/src/types.ts#L1045)

Whether to skip the factory's `defaultMountOptions`.

Does not exclude `defaultProps`, `defaultSlots`, or the active
preset's default plugin configuration.

Defaults to `false`.

***

### skipDefaultProps?

> `optional` **skipDefaultProps?**: `boolean`

Defined in: [packages/vue-test-core/src/types.ts:1025](https://github.com/testforgejs/testforge/blob/445a1dda5af6e9fa30f2b4c58bbec4097a4a4e7a/packages/vue-test-core/src/types.ts#L1025)

Whether to skip the factory's `defaultProps`.

Does not exclude props supplied through `defaultMountOptions.props`
or the current mount's arguments.

Defaults to `false`.

***

### skipDefaultSlots?

> `optional` **skipDefaultSlots?**: `boolean`

Defined in: [packages/vue-test-core/src/types.ts:1035](https://github.com/testforgejs/testforge/blob/445a1dda5af6e9fa30f2b4c58bbec4097a4a4e7a/packages/vue-test-core/src/types.ts#L1035)

Whether to skip the factory's `defaultSlots`.

Does not exclude slots supplied through `defaultMountOptions.slots`
or the current mount's arguments.

Defaults to `false`.
