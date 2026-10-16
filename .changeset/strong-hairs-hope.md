---
"@testforgejs/vue-test-core": major
---

Replace the legacy `expose` option with symbol-based plugin instance capturing.

**Breaking change:** The `expose` option is no longer supported for capturing managed plugin instances. Use `captureInstance<T>()` instead.

The `captureInstance()` helper now uses an internal symbol-keyed callback, preventing conflicts with native plugin options. Its `instance` getter is non-enumerable and is not copied when spreading capture options into plugin configuration.

Internal instance capture and shared-instance options are excluded from the options passed to native plugin factories. Native plugin options, including an `expose` option if supported by the underlying library, are preserved.

**Migration example:**

Before:

```ts
let piniaInstance;

factory(
  {},
  {
    plugins: {
      pinia: {
        expose(instance) {
          piniaInstance = instance;
        },
      },
    },
  },
);
```

After:

````ts
import { captureInstance } from "@testforgejs/vue-test-core";
import type { Pinia } from "pinia";

const piniaCapture = captureInstance<Pinia>();

factory({}, {
  plugins: {
    pinia: {
      ...piniaCapture,
    },
  },
});

const piniaInstance = piniaCapture.instance;
```# An empty message aborts the editor.

````
