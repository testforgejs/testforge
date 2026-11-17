[**@testforgejs/vue-test-core**](../README.md)

***

> **PluginOptionsFactory**\<`TOptions`\> = () => `TOptions`

Defined in: [packages/vue-test-core/src/types.ts:39](https://github.com/testforgejs/testforge/blob/445a1dda5af6e9fa30f2b4c58bbec4097a4a4e7a/packages/vue-test-core/src/types.ts#L39)

Factory that produces plugin options when invoked.

Used to provide preset-level default configuration for a plugin.
Should return fresh mutable configuration data to avoid shared
state between independent plugin initializations.

## Type Parameters

### TOptions

`TOptions`

The type of plugin options produced by the factory.

## Returns

`TOptions`
