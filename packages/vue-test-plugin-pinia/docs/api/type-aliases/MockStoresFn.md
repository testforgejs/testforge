[**@testforgejs/vue-test-plugin-pinia**](../README.md)

***

> **MockStoresFn** = (`pinia`) => `void`

Defined in: [types/types.ts:12](https://github.com/testforgejs/testforge/blob/7a79f4b4e191aaf8a669d44c60d1cc858d263ed5/packages/vue-test-plugin-pinia/src/types/types.ts#L12)

A callback for configuring Pinia stores after the testing Pinia instance
is created and before the component is mounted.

Use it to initialize or modify stores required by the test.

## Parameters

### pinia

`TestingPinia`

The testing Pinia instance used by the mounted component.

## Returns

`void`
