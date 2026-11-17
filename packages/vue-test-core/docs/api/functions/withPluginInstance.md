[**@testforgejs/vue-test-core**](../README.md)

***

> **withPluginInstance**\<`TInstance`\>(`instance`): `PluginInstanceInput`\<`TInstance`\>

Defined in: [packages/vue-test-core/src/plugins/helpers/withPluginInstance.ts:31](https://github.com/testforgejs/testforge/blob/445a1dda5af6e9fa30f2b4c58bbec4097a4a4e7a/packages/vue-test-core/src/plugins/helpers/withPluginInstance.ts#L31)

Configures TestForge to reuse an existing managed plugin instance.

The provided instance is used instead of creating a new one.
The same instance is reused without cloning or resetting its state.

Intended for factory-based plugins that support managed instance reuse.
Install-based plugins do not support shared instances.

## Type Parameters

### TInstance

`TInstance`

The type of the managed plugin instance.

## Parameters

### instance

`TInstance`

The existing plugin instance to reuse.

## Returns

`PluginInstanceInput`\<`TInstance`\>

Plugin configuration containing the shared-instance reference.

## Example

```ts
factory({}, {
  plugins: {
    pinia: {
      ...withPluginInstance(existingPinia),
    },
  },
});
```
