---
"@testforge/vue-test-core": minor
---

feat: added runtime validation for `createTestFramework()` options

Invalid framework options are now detected during initialization with descriptive error messages. This includes validation of:

- plain object options;
- `shallowByDefault`;
- preset collections;
- preset manifests and plugin defaults.

Also added runtime and type-level tests for the guard and assertion utilities used by the validation layer.
