[**@testforgejs/vue-test-core**](../README.md)

***

> **RuntimePluginOptions**\<`TInstance`, `TOptions`\> = `TOptions` & `PluginInstanceControls`\<`TInstance`\>

Defined in: [packages/vue-test-core/src/types.ts:410](https://github.com/testforgejs/testforge/blob/445a1dda5af6e9fa30f2b4c58bbec4097a4a4e7a/packages/vue-test-core/src/types.ts#L410)

Options passed to a managed plugin's creation function.

Combines native plugin options with internal TestForge controls
for instance capture and reuse.

Shared-instance metadata has already been resolved into runtime
controls by the plugin pipeline.

## Type Parameters

### TInstance

`TInstance`

The type of the managed plugin instance.

### TOptions

`TOptions` = `object`

The native options accepted by the plugin factory.
