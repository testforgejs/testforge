[**@testforgejs/vue-test-plugin-pinia**](../README.md)

***

> **MockStoresFn** = (`pinia`) => `void`

Defined in: [types/types.ts:12](https://github.com/testforgejs/testforge/blob/8c3ef83f30f0f5649f00dec51636fdc491be0cc0/packages/vue-test-plugin-pinia/src/types/types.ts#L12)

A callback for configuring stores on a resolved testing Pinia instance
before the component is mounted.

The instance may be newly created or reused through `__meta.instance`.

## Parameters

### pinia

`TestingPinia`

The testing Pinia instance used by the mounted component.

## Returns

`void`
