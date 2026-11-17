[**@testforgejs/vue-test-core**](../README.md)

***

Defined in: [packages/vue-test-core/src/types.ts:273](https://github.com/testforgejs/testforge/blob/445a1dda5af6e9fa30f2b4c58bbec4097a4a4e7a/packages/vue-test-core/src/types.ts#L273)

Registry of managed plugin instance types.

Extend through module augmentation to associate plugin names with
their runtime instance types.

Registration enables type-safe instance capture and reuse in plugin
configuration, and provides valid plugin names and instance types
for `fromPluginInstance()`.

Only plugins supporting managed instances should be registered.
Install-based plugins without managed instances must be excluded.
