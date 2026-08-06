---
"@testforgejs/vue-test-core": patch
---

fix: merge attrs instead of replacing default attrs

Fixed `attrs` handling in `testComponentFactory`.

Previously, `mountOptions.attrs` replaced `defaultMountOptions.attrs` entirely. Now both objects are shallow-merged, following the same behavior used for `props`, `slots`, and other mount configuration options.

Priority order:

- `mountOptions.attrs`
- `defaultMountOptions.attrs`

The `skipDefaultOptions` flag continues to disable default attrs.
