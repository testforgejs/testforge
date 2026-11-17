[**@testforgejs/vue-test-core**](../README.md)

***

> **DefaultMountOptionsResolver**\<`T`\> = () => [`ComponentFactoryOptions`](../interfaces/ComponentFactoryOptions.md)\<`ComponentPropsInput`\<`T`\>, `ComponentSlotsInput`\<`T`\>, `ComponentDataInput`\<`T`\>\>

Defined in: [packages/vue-test-core/src/types.ts:790](https://github.com/testforgejs/testforge/blob/445a1dda5af6e9fa30f2b4c58bbec4097a4a4e7a/packages/vue-test-core/src/types.ts#L790)

Resolves default mounting options for each mount.

The resolver is invoked once per mount and should return fresh
mutable configuration data to prevent shared state between mounts.

Supports Vue Test Utils mounting options and TestForge-managed
plugin configuration.

## Type Parameters

### T

`T` *extends* `Component`

The Vue component type used to infer props, slots,
and component data within the mounting options.

## Returns

[`ComponentFactoryOptions`](../interfaces/ComponentFactoryOptions.md)\<`ComponentPropsInput`\<`T`\>, `ComponentSlotsInput`\<`T`\>, `ComponentDataInput`\<`T`\>\>
