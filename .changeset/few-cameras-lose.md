---
"@testforge/vue-test-core": minor
"@testforge/vue-test-plugin-i18n": patch
---

feat: refactored plugin typing architecture.

Plugin generics were reordered from `<TOptions, TInstance>` to `<TInstance, TOptions>` for improved readability and API ergonomics.

Plugin definitions are no longer constrained to Vue `Plugin` instances from `@vue/runtime-core`. This allows the plugin system to support arbitrary runtime instances and removes unnecessary coupling to Vue internals.

This change improves TypeScript inference and makes custom plugin development more flexible.
