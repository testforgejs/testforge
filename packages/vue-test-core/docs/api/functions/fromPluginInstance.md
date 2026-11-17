[**@testforgejs/vue-test-core**](../README.md)

***

> **fromPluginInstance**\<`TPluginName`, `TResult`\>(`pluginName`, `resolve`): [`PluginInstanceReference`](../interfaces/PluginInstanceReference.md)\<`TPluginName`, `TResult`\>

Defined in: [packages/vue-test-core/src/plugins/dependencies/fromPluginInstance.ts:37](https://github.com/testforgejs/testforge/blob/445a1dda5af6e9fa30f2b4c58bbec4097a4a4e7a/packages/vue-test-core/src/plugins/dependencies/fromPluginInstance.ts#L37)

Creates a deferred reference to a managed plugin's runtime instance.

The reference can be used in another managed plugin's configuration.
The pipeline resolves it after ordering plugin dependencies and
creating the referenced plugin instance.

The resolver receives the referenced instance and produces the
configuration value that replaces the deferred reference.

## Type Parameters

### TPluginName

`TPluginName` *extends* `never`

The name of the registered managed plugin
whose instance is referenced.

### TResult

`TResult`

The type of the value produced by the resolver.

## Parameters

### pluginName

`TPluginName`

The name of the managed plugin whose instance is required.

### resolve

(`instance`) => `TResult`

Maps the referenced instance to a configuration value.

## Returns

[`PluginInstanceReference`](../interfaces/PluginInstanceReference.md)\<`TPluginName`, `TResult`\>

A deferred plugin instance reference.

## Example

```ts
fromPluginInstance(I18N_PLUGIN_NAME, (i18n) =>
  createVueI18nAdapter({
    i18n,
    useI18n,
  }),
);
```
