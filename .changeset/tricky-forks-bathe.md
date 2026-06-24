---
"@testforge/vue-test-core": patch
---

fix: fixed an issue where switching presets at runtime could fail if `defaultMountOptions.plugins`

Default plugin configuration is now filtered by the active preset before entering
the runtime plugin pipeline, allowing factories to define plugin defaults for the
main preset while safely switching to narrower presets in individual tests.
