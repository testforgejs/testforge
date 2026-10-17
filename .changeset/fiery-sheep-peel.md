---
"@testforgejs/vue-test-plugin-pinia": minor
---

Change `VueTestPiniaOptions` from an interface to a type alias.

The new definition combines `TestingOptions`, `PluginControlOptions<TestingPinia>`, and the TestForge-specific `mockStores` option using an intersection type.

Existing plugin configuration and runtime behavior remain unchanged.

**TypeScript compatibility:** Declaration merging is no longer supported for `VueTestPiniaOptions`. Consumers augmenting this interface must migrate to explicit type extensions or intersections.
