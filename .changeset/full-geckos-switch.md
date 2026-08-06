---
"@testforgejs/vue-test-core": minor
---

feat: export TestFramework from the public API.

Consumers can now import and use the TestFramework type directly when typing framework instances created by createTestFramework().

This change affects TypeScript typings only and does not modify runtime behavior.
