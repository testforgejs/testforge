---
"@testforgejs/vue-test-core": minor
---

Add an optional `ComponentFactoryConfig` parameter to the positional `testComponentFactory()` API.

The fifth argument allows selecting a factory-level preset using `config.presetKey` without migrating existing tests to `testComponentFactory.withOptions()`.

The selected preset applies to all mounts created by the factory unless overridden by `extraOptions.presetKey` for an individual mount.

Factory configuration is validated at creation time, including the configuration object shape and the selected preset key.

The existing positional arguments and their behavior remain unchanged.
