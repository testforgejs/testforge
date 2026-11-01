---
"@testforgejs/vue-test-core": patch
---

Improve plugin option validation for factory-level and mount-level preset selection.

- Validate `defaultMountOptions.plugins` against the explicitly selected factory-level preset during factory creation.
- Validate mount arguments using the effective preset, respecting mount-level overrides via `extraOptions.presetKey`.
- Preserve existing behavior when switching presets per mount, allowing unsupported default plugins to be filtered out without errors.
- Reuse the shared plugin compatibility validator for consistent validation rules and error messages.
