---
"@testforgejs/vue-test-core": major
---

**BREAKING CHANGE:** Replace string-keyed `__meta.instance` with the `withPluginInstance()` helper for reusing pre-created plugin instances.

Plugin instance metadata now uses an internal `Symbol` key instead of the reserved `__meta` property, preventing collisions with native plugin configuration options.

To migrate, replace:

```ts
plugins: {
  pinia: {
    __meta: {
      instance: existingPinia,
    },
  },
}
```

with:

```ts
import { withPluginInstance } from "@testforgejs/vue-test-core";

plugins: {
  pinia: {
    ...withPluginInstance(existingPinia),
  },
}
```

The `withPluginInstance()` helper requires a pre-created plugin instance and cannot accept deferred references created by `fromPluginInstance()`.

Existing integrations with `captureInstance()` and plugin-specific helpers such as Pinia's `withMockStores()` remain supported.
