[**@testforgejs/vue-test-plugin-pinia**](../README.md)

***

> **MockStoresFn** = (`pinia`) => `void`

Defined in: [packages/vue-test-plugin-pinia/src/types/types.ts:12](https://github.com/testforgejs/testforge/blob/f33f94ae27bd629953d819b81fc4c9eb7753baa6/packages/vue-test-plugin-pinia/src/types/types.ts#L12)

A callback for configuring Pinia stores after the testing Pinia instance
is created and before the component is mounted.

Use it to initialize or modify stores required by the test.

## Parameters

### pinia

`TestingPinia`

The testing Pinia instance used by the mounted component.

## Returns

`void`
