[**@testforgejs/vue-test-plugin-pinia**](../README.md)

***

> **MockStoresFn** = (`pinia`) => `void`

Defined in: [types/types.ts:14](https://github.com/testforgejs/testforge/blob/15b7fe253d452c54fcef8aae7128adc59fceb969/packages/vue-test-plugin-pinia/src/types/types.ts#L14)

A callback for configuring Pinia stores after the testing Pinia
instance has been resolved and before the component is mounted.

The instance may be newly created or reused through `withPluginInstance()`.

## Parameters

### pinia

`TestingPinia`

The testing Pinia instance used by the mounted component.

## Returns

`void`
