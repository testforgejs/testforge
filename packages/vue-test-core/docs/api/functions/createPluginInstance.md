[**@testforgejs/vue-test-core**](../README.md)

***

> **createPluginInstance**\<`TInstance`, `TOptions`\>(`factory`, `options`): `TInstance`

Defined in: [packages/vue-test-core/src/plugins/instances/createPluginInstance.ts:30](https://github.com/testforgejs/testforge/blob/445a1dda5af6e9fa30f2b4c58bbec4097a4a4e7a/packages/vue-test-core/src/plugins/instances/createPluginInstance.ts#L30)

Creates or reuses a managed plugin instance.

Reuses the supplied shared instance when available; otherwise invokes
the native plugin factory after removing TestForge's instance capture
and shared-instance controls from the options.

Exposes the resulting instance through the configured capture callback,
whether the instance was newly created or reused.

The input options object is not mutated.

Intended for factory-based integrations. Use `createVuePlugin()`
for install-based plugins.

## Type Parameters

### TInstance

`TInstance`

The type of the managed plugin instance.

### TOptions

`TOptions` *extends* `object`

The native options accepted by the plugin factory.

## Parameters

### factory

(`options`) => `TInstance`

The native plugin factory used to create a new instance.

### options

[`RuntimePluginOptions`](../type-aliases/RuntimePluginOptions.md)\<`TInstance`, `TOptions`\>

The resolved plugin options, including optional
TestForge instance controls.

## Returns

`TInstance`

The newly created or reused plugin instance.
