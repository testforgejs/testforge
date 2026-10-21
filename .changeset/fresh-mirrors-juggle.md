---
"@testforgejs/vue-test-plugin-pinia": major
---

Replace the legacy string-keyed `mockStores` option with the symbol-based `withMockStores()` helper.

**Breaking change:** The `mockStores` option is no longer supported. Use `withMockStores(callback)` instead.

The new helper uses an internal symbol-keyed property to configure store initialization without conflicting with native `@pinia/testing` options.

The internal callback is extracted before passing configuration to the native Pinia factory, ensuring that only supported native options are forwarded.

The callback continues to run after the Pinia instance has been resolved and before the component is mounted, including when an existing instance is reused through `__meta.instance`.

**Migration example:**

Before:

```ts
factory({}, {
  plugins: {
    pinia: {
      stubActions: false,
      mockStores: (pinia) => {
        const store = useCounterStore(pinia);
        store.count = 42;
      },
    },
  },
});

After:

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

The `withMockStores()` helper supports both newly created and explicitly reused Pinia instances. Existing instance reuse behavior remains unchanged.

```
