[**@testforgejs/vue-test-core**](../README.md)

***

Defined in: [packages/vue-test-core/src/types.ts:210](https://github.com/testforgejs/testforge/blob/445a1dda5af6e9fa30f2b4c58bbec4097a4a4e7a/packages/vue-test-core/src/types.ts#L210)

Declares a TestForge-managed plugin in a preset manifest.

Associates a plugin module with its initial enabled state.
Disabled plugins remain available for explicit activation
through managed plugin configuration.

## Type Parameters

### TPlugin

`TPlugin` *extends* [`MountPlugin`](../type-aliases/MountPlugin.md) = [`MountPlugin`](../type-aliases/MountPlugin.md)

The plugin value created by the module.

### TOptions

`TOptions` = `unknown`

The options accepted by the module's plugin definition.

## Properties

### enabled

> **enabled**: `boolean`

Defined in: [packages/vue-test-core/src/types.ts:226](https://github.com/testforgejs/testforge/blob/445a1dda5af6e9fa30f2b4c58bbec4097a4a4e7a/packages/vue-test-core/src/types.ts#L226)

Whether the plugin is enabled by default in this preset.

A value of `false` does not prevent explicit activation
through managed plugin configuration.

***

### module

> **module**: [`PluginModule`](PluginModule.md)\<`TPlugin`, `TOptions`\>

Defined in: [packages/vue-test-core/src/types.ts:218](https://github.com/testforgejs/testforge/blob/445a1dda5af6e9fa30f2b4c58bbec4097a4a4e7a/packages/vue-test-core/src/types.ts#L218)

Plugin module providing its name, creation contract,
and optional default-options factory.
