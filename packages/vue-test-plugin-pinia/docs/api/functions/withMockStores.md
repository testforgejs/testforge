[**@testforgejs/vue-test-plugin-pinia**](../README.md)

***

> **withMockStores**(`mockStores`): `object`

Defined in: [helpers/withMockStores.ts:34](https://github.com/testforgejs/testforge/blob/e7a79bfa09a370e19f625ad91df804394db829ef/packages/vue-test-plugin-pinia/src/helpers/withMockStores.ts#L34)

Creates Pinia plugin options for initializing or modifying stores
before the component is mounted.

The callback receives the resolved testing Pinia instance, whether
it was newly created or reused through `withPluginInstance()`.

Spread the returned options into the Pinia configuration provided
to a TestForge component factory.

## Parameters

### mockStores

[`MockStoresFn`](../type-aliases/MockStoresFn.md)

Callback invoked with the resolved testing Pinia instance.

## Returns

`object`

Plugin options containing the store initialization callback.

### \[MOCK\_STORES\]

> **\[MOCK\_STORES\]**: [`MockStoresFn`](../type-aliases/MockStoresFn.md) = `mockStores`

## Example

```ts
import { withMockStores } from "@testforgejs/vue-test-plugin-pinia";

factory({}, {
  plugins: {
    pinia: {
      ...withMockStores((pinia) => {
        const store = useCounterStore(pinia);
        store.count = 42;
      }),
    },
  },
});
```
