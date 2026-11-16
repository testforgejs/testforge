---
"@testforgejs/vue-test-core": patch
---

Fix preset validation to reject malformed manifest entries before destructuring them.

Invalid entries, including `null` and `undefined`, now produce consistent TestForge validation errors instead of unexpected `TypeError` exceptions.

Improve preset manifest validation by rejecting malformed entries and plugin modules that do not implement the required `getDefinition()` method.

Invalid manifest entries and incomplete plugin modules now produce consistent TestForge validation errors.
