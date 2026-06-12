---
"@testforge/vue-test-core": minor
---

feat: added runtime validation for component factory invocation arguments

Added third-level runtime validation for component factory calls.

Arguments passed to `factory(props, mountOptions, slots, extraOptions)` are now validated before mount execution.

Invalid objects and invalid boolean flags produce descriptive errors, improving debugging and making runtime behavior more predictable.
