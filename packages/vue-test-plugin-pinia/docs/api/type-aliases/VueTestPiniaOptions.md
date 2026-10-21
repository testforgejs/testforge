[**@testforgejs/vue-test-plugin-pinia**](../README.md)

***

> **VueTestPiniaOptions** = `TestingOptions` & `PluginControlOptions`\<`TestingPinia`\> & `object`

Defined in: [types/types.ts:48](https://github.com/testforgejs/testforge/blob/dc04789c621fa614ec1c13d55b27674bd4cdd4c9/packages/vue-test-plugin-pinia/src/types/types.ts#L48)

Configuration options for the Pinia test plugin.

Combines native Pinia testing options with TestForge-specific
controls for managed plugin instances and store initialization.

Use `withMockStores()` to initialize or modify Pinia stores before
the component is mounted.

The store setup callback runs for both newly created Pinia instances
and existing instances reused through `__meta.instance`.

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

 - `TestingOptions` from `@pinia/testing` for native Pinia configuration.
 - `PluginControlOptions` from `@testforgejs/vue-test-core`.
