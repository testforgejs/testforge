[**@testforgejs/vue-test-plugin-pinia**](../README.md)

***

> **MockStoresFn** = (`pinia`) => `void`

Defined in: [types/types.ts:14](https://github.com/testforgejs/testforge/blob/dc04789c621fa614ec1c13d55b27674bd4cdd4c9/packages/vue-test-plugin-pinia/src/types/types.ts#L14)

A callback for configuring Pinia stores after the testing Pinia
instance has been resolved and before the component is mounted.

The instance may be newly created or reused through `__meta.instance`.

## Parameters

### pinia

`TestingPinia`

The testing Pinia instance used by the mounted component.

## Returns

`void`
