[**@testforgejs/vue-test-plugin-pinia**](../README.md)

***

> **MockStoresFn** = (`pinia`) => `void`

Defined in: [packages/vue-test-plugin-pinia/src/types/types.ts:12](https://github.com/testforgejs/testforge/blob/3d728172a303d7e9d78fc42ed41f076e9b5d2096/packages/vue-test-plugin-pinia/src/types/types.ts#L12)

A callback for configuring Pinia stores after the testing Pinia instance
is created and before the component is mounted.

Use it to initialize or modify stores required by the test.

## Parameters

### pinia

`TestingPinia`

The testing Pinia instance used by the mounted component.

## Returns

`void`
