[**@testforgejs/vue-test-core**](../README.md)

***

> **PluginDefaultOptionsFactory**\<`TOptions`\> = (`runner?`) => [`PluginOptionsFactory`](PluginOptionsFactory.md)\<`TOptions`\>

Defined in: [packages/vue-test-core/src/types.ts:51](https://github.com/testforgejs/testforge/blob/445a1dda5af6e9fa30f2b4c58bbec4097a4a4e7a/packages/vue-test-core/src/types.ts#L51)

Creates a plugin options factory, optionally using test-runner operations.

The runner dependency is supplied when this function is called.
The returned `PluginOptionsFactory` produces the actual plugin options
when invoked, allowing configuration to be created independently.

## Type Parameters

### TOptions

`TOptions`

The type of plugin options produced by
the returned factory.

## Parameters

### runner?

[`UniversalRunner`](../interfaces/UniversalRunner.md)

## Returns

[`PluginOptionsFactory`](PluginOptionsFactory.md)\<`TOptions`\>
