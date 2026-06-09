---
"@testforge/vue-test-core": minor
---

fix: improve TypeScript support for `testComponentFactory()` by inferring prop types from Vue component definitions

This enables automatic validation of:

- factory default props
- per-test props
- `defaultMountOptions.props`
- `mountOptions.props`

Unknown prop names and invalid prop value types are now detected at compile time, providing stronger type safety and better editor autocompletion.
