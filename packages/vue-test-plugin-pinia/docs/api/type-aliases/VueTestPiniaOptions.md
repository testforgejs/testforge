[**@testforgejs/vue-test-plugin-pinia**](../README.md)

***

> **VueTestPiniaOptions** = `TestingOptions` & `PluginControlOptions`\<`TestingPinia`\> & `object`

Defined in: [types/types.ts:26](https://github.com/testforgejs/testforge/blob/7a79f4b4e191aaf8a669d44c60d1cc858d263ed5/packages/vue-test-plugin-pinia/src/types/types.ts#L26)

Configuration options for the Pinia test plugin.

Combines native Pinia testing options with TestForge-specific
controls for managed plugin instances and store initialization.

Instance capturing is handled internally by TestForge using
`captureInstance<TestingPinia>()`.

## Type Declaration

### mockStores?

> `optional` **mockStores?**: [`MockStoresFn`](MockStoresFn.md)

A callback for initializing or modifying Pinia stores after the
testing Pinia instance is created and before the component is mounted.

#### Example

```ts
factory({}, {
  plugins: {
    pinia: {
      mockStores: (pinia) => {
        const store = useCounterStore(pinia);
        store.count = 42;
      },
    },
  },
});
```

## See

 - `TestingOptions` from `@pinia/testing` for native Pinia testing configuration.
 - `PluginControlOptions` from `@testforgejs/vue-test-core` for type-safe instance capturing.
