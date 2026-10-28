[**@testforgejs/vue-test-plugin-pinia**](../README.md)

***

> **VueTestPiniaOptions** = `TestingOptions` & `object`

Defined in: [types/types.ts:50](https://github.com/testforgejs/testforge/blob/9fe06ed8809dd0c6a08450484b8c012e43032cd5/packages/vue-test-plugin-pinia/src/types/types.ts#L50)

Configuration options for the Pinia test plugin.

Extends native Pinia testing options with TestForge-specific
store initialization support.

Managed instance controls are provided separately by TestForge
through its plugin configuration types.

Use `withMockStores()` to initialize or modify Pinia stores before
the component is mounted.

The store setup callback runs for both newly created Pinia instances
and pre-created instances reused through `withPluginInstance()`.

## Example

```ts
import { withMockStores } from "@testforgejs/vue-test-plugin-pinia";

factory({}, {
  plugins: {
    pinia: {
      stubActions: false,
      ...withMockStores((pinia) => {
        const store = useCounterStore(pinia);
        store.count = 42;
      }),
    },
  },
});
```

## See

`TestingOptions` from `@pinia/testing` for native Pinia configuration.
