---
"@testforgejs/vue-test-core": patch
---

fix: improve runtime validation when merging configuration objects.

`mergeConfigs()` now rejects invalid inputs instead of silently accepting values such as `null`, numbers, or strings. This prevents malformed `mountOptions.global` values from propagating through the pipeline and surfaces configuration errors earlier with clearer error messages.
