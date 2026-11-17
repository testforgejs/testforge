[**@testforgejs/vue-test-core**](../README.md)

***

> **TestFrameworkPresets** = `Record`\<`string`, [`PresetDefinition`](../interfaces/PresetDefinition.md)\>

Defined in: [packages/vue-test-core/src/types.ts:673](https://github.com/testforgejs/testforge/blob/445a1dda5af6e9fa30f2b4c58bbec4097a4a4e7a/packages/vue-test-core/src/types.ts#L673)

Collection of named presets registered with a TestForge framework.

Each key identifies a preset that can be selected through `presetKey`.
When present, the `"default"` preset is used if neither the factory
nor the current mount explicitly selects another preset.

Each entry defines a complete preset rather than an extension
of another registered preset.
