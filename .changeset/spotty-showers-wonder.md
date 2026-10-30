---
"@testforgejs/vue-test-core": minor
---

Add `testComponentFactory.withOptions()` for object-based component factory configuration.

The new API supports:

- Configuring `component`, `defaultProps`, `defaultMountOptions`, and `defaultSlots` through a single options object.
- Selecting a factory-level preset using `presetKey`.
- Overriding the factory preset per mount using `extraOptions.presetKey`, without affecting subsequent mounts.
- Validating factory creation options and preset keys at runtime.
- Validating `defaultMountOptions` against the selected factory preset.

The existing positional `testComponentFactory()` API remains unchanged.
