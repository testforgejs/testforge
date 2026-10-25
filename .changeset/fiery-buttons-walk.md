---
"@testforgejs/vue-test-core": patch
---

Fix plugin disabling via `extraOptions.plugins` by correctly applying explicit `false` overrides to the runtime plugin state.

Ensure disabled plugins remain disabled throughout subsequent pipeline stages.
