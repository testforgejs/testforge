---
"@testforge/vue-test-core": minor
---

feat: added runtime validation for `testComponentFactory()` arguments

`component`, `defaultProps`, `defaultMountOptions`, and `defaultSlots` are now validated and throw descriptive errors when invalid values are provided.
