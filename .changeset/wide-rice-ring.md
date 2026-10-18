---
"@testforgejs/vue-test-core": patch
---

Replace the internal `__sharedInstance` string key with a unique symbol to prevent collisions with native plugin configuration options.

Update runtime configuration handling to preserve enumerable symbol-keyed properties while keeping shared plugin instances opaque during dependency collection and reference resolution.

No changes to the public API or existing plugin instance management behavior.
