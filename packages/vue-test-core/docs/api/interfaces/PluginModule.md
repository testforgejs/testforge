[**@testforgejs/vue-test-core**](../README.md)

***

Defined in: [packages/vue-test-core/src/types.ts:153](https://github.com/testforgejs/testforge/blob/445a1dda5af6e9fa30f2b4c58bbec4097a4a4e7a/packages/vue-test-core/src/types.ts#L153)

Defines a named TestForge-managed plugin module.

Provides a stable plugin identifier and a definition used by the
framework to create and initialize the plugin.

Optionally exposes a factory for preset-level default configuration.

## Extended by

- [`PluginModuleWithDefaults`](PluginModuleWithDefaults.md)

## Type Parameters

### TPlugin

`TPlugin` *extends* [`MountPlugin`](../type-aliases/MountPlugin.md) = [`MountPlugin`](../type-aliases/MountPlugin.md)

The Vue Test Utils-compatible plugin value
produced by the module's creation function.

### TOptions

`TOptions` = `unknown`

The options accepted by the plugin definition.

## Properties

### getDefaultOptions?

> `optional` **getDefaultOptions?**: [`PluginDefaultOptionsFactory`](../type-aliases/PluginDefaultOptionsFactory.md)\<`TOptions`\>

Defined in: [packages/vue-test-core/src/types.ts:172](https://github.com/testforgejs/testforge/blob/445a1dda5af6e9fa30f2b4c58bbec4097a4a4e7a/packages/vue-test-core/src/types.ts#L172)

Creates a factory for preset-level default plugin options.

Optionally accepts test-runner operations and returns an options
factory rather than the configuration object itself.

## Methods

### getDefinition()

> **getDefinition**(): [`PluginDefinition`](PluginDefinition.md)\<`TPlugin`, `TOptions`\>

Defined in: [packages/vue-test-core/src/types.ts:164](https://github.com/testforgejs/testforge/blob/445a1dda5af6e9fa30f2b4c58bbec4097a4a4e7a/packages/vue-test-core/src/types.ts#L164)

Returns the plugin creation contract and optional lifecycle hooks.

#### Returns

[`PluginDefinition`](PluginDefinition.md)\<`TPlugin`, `TOptions`\>

***

### getName()

> **getName**(): `string`

Defined in: [packages/vue-test-core/src/types.ts:159](https://github.com/testforgejs/testforge/blob/445a1dda5af6e9fa30f2b4c58bbec4097a4a4e7a/packages/vue-test-core/src/types.ts#L159)

Returns the stable identifier used to register and configure the plugin.

The identifier must be unique within a preset manifest.

#### Returns

`string`
