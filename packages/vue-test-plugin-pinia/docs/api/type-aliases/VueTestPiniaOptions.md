[**@testforgejs/vue-test-plugin-pinia**](../README.md)

***

> **VueTestPiniaOptions** = `TestingOptions` & `PluginControlOptions`\<`TestingPinia`\> & `object`

Defined in: [types/types.ts:26](https://github.com/testforgejs/testforge/blob/8c3ef83f30f0f5649f00dec51636fdc491be0cc0/packages/vue-test-plugin-pinia/src/types/types.ts#L26)

Configuration options for the Pinia test plugin.

Combines native Pinia testing options with TestForge-specific
controls for managed plugin instances and store initialization.

Instance capturing is handled internally by TestForge using
`captureInstance<TestingPinia>()`.

## Type Declaration

### mockStores?

> `optional` **mockStores?**: [`MockStoresFn`](MockStoresFn.md)

A callback for initializing or modifying Pinia stores before the
component is mounted.

The callback runs after the Pinia instance has been resolved,
regardless of whether it was newly created or provided through
`__meta.instance`.

When an existing Pinia instance is reused, the callback operates
on that same instance and may modify its existing stores.

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
