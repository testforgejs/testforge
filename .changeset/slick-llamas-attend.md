---
"@testforgejs/vue-test-core": patch
---

Disallow `captureInstance()` in `defaultMountOptions` to prevent shared instance captures across component mounts.

Add runtime validation that rejects instance capture in factory-level plugin defaults, even when the configuration is overridden by `mountOptions` or skipped via `skipDefaultOptions`.

Instance capture remains supported in per-mount `mountOptions` and `extraOptions`.
