[**@testforgejs/vue-test-core**](../README.md)

***

Defined in: [packages/vue-test-core/src/types.ts:187](https://github.com/testforgejs/testforge/blob/445a1dda5af6e9fa30f2b4c58bbec4097a4a4e7a/packages/vue-test-core/src/types.ts#L187)

Plugin module that guarantees an available default-options factory.

Extends `PluginModule` by requiring `getDefaultOptions()`, allowing
consumers to obtain a plugin options factory without checking
whether the method is defined.

## Extends

- [`PluginModule`](PluginModule.md)\<`TPlugin`, `TOptions`\>

## Type Parameters

### TPlugin

`TPlugin` *extends* [`MountPlugin`](../type-aliases/MountPlugin.md) = [`MountPlugin`](../type-aliases/MountPlugin.md)

The Vue Test Utils-compatible plugin value
produced by the module's creation function.

### TOptions

`TOptions` = `unknown`

The options accepted by the plugin definition
and produced by its default-options factory.

## Properties

### getDefaultOptions

> **getDefaultOptions**: [`PluginDefaultOptionsFactory`](../type-aliases/PluginDefaultOptionsFactory.md)\<`TOptions`\>

Defined in: [packages/vue-test-core/src/types.ts:197](https://github.com/testforgejs/testforge/blob/445a1dda5af6e9fa30f2b4c58bbec4097a4a4e7a/packages/vue-test-core/src/types.ts#L197)

Provides a factory for preset-level default plugin options.

May receive test-runner operations and returns an options factory
rather than the options object itself.

#### Overrides

[`PluginModule`](PluginModule.md).[`getDefaultOptions`](PluginModule.md#getdefaultoptions)

## Methods

### getDefinition()

> **getDefinition**(): [`PluginDefinition`](PluginDefinition.md)\<`TPlugin`, `TOptions`\>

Defined in: [packages/vue-test-core/src/types.ts:164](https://github.com/testforgejs/testforge/blob/445a1dda5af6e9fa30f2b4c58bbec4097a4a4e7a/packages/vue-test-core/src/types.ts#L164)

Returns the plugin creation contract and optional lifecycle hooks.

#### Returns

[`PluginDefinition`](PluginDefinition.md)\<`TPlugin`, `TOptions`\>

#### Inherited from

[`PluginModule`](PluginModule.md).[`getDefinition`](PluginModule.md#getdefinition)

***

### getName()

> **getName**(): `string`

Defined in: [packages/vue-test-core/src/types.ts:159](https://github.com/testforgejs/testforge/blob/445a1dda5af6e9fa30f2b4c58bbec4097a4a4e7a/packages/vue-test-core/src/types.ts#L159)

Returns the stable identifier used to register and configure the plugin.

The identifier must be unique within a preset manifest.

#### Returns

`string`

#### Inherited from

[`PluginModule`](PluginModule.md).[`getName`](PluginModule.md#getname)
