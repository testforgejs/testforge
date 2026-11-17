[**@testforgejs/vue-test-core**](../README.md)

***

> **DefaultSlotsResolver**\<`T`\> = () => `ComponentSlotsInput`\<`T`\>

Defined in: [packages/vue-test-core/src/types.ts:804](https://github.com/testforgejs/testforge/blob/445a1dda5af6e9fa30f2b4c58bbec4097a4a4e7a/packages/vue-test-core/src/types.ts#L804)

Resolves default component slots for each mount.

The resolver is invoked once per mount and should return fresh
mutable data to prevent shared state between component mounts.

## Type Parameters

### T

`T` *extends* `Component`

The Vue component type used to infer default slots.

## Returns

`ComponentSlotsInput`\<`T`\>
