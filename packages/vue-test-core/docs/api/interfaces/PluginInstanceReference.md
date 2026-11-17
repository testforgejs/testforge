[**@testforgejs/vue-test-core**](../README.md)

***

Defined in: [packages/vue-test-core/src/types.ts:435](https://github.com/testforgejs/testforge/blob/445a1dda5af6e9fa30f2b4c58bbec4097a4a4e7a/packages/vue-test-core/src/types.ts#L435)

Deferred configuration value resolved from a managed plugin instance.

Identifies the source plugin and provides a resolver that derives
the configuration value after the source instance becomes available.

Created by `fromPluginInstance()`.

## Type Parameters

### TPluginName

`TPluginName` *extends* `PluginInstanceName`

The name of the registered managed plugin
whose instance is referenced.

### TResult

`TResult`

The type of the resolved configuration value.

## Properties

### \_\_type

> `readonly` **\_\_type**: `"plugin-instance-reference"`

Defined in: [packages/vue-test-core/src/types.ts:437](https://github.com/testforgejs/testforge/blob/445a1dda5af6e9fa30f2b4c58bbec4097a4a4e7a/packages/vue-test-core/src/types.ts#L437)

Internal discriminator identifying a deferred instance reference.

***

### pluginName

> `readonly` **pluginName**: `TPluginName`

Defined in: [packages/vue-test-core/src/types.ts:440](https://github.com/testforgejs/testforge/blob/445a1dda5af6e9fa30f2b4c58bbec4097a4a4e7a/packages/vue-test-core/src/types.ts#L440)

Name of the managed plugin providing the referenced instance.

***

### resolve

> `readonly` **resolve**: (`instance`) => `TResult`

Defined in: [packages/vue-test-core/src/types.ts:443](https://github.com/testforgejs/testforge/blob/445a1dda5af6e9fa30f2b4c58bbec4097a4a4e7a/packages/vue-test-core/src/types.ts#L443)

Derives a configuration value from the referenced plugin instance.

#### Parameters

##### instance

[`PluginInstanceMap`](PluginInstanceMap.md)\[`TPluginName`\]

#### Returns

`TResult`
