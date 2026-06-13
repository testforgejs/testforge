---
"@testforge/vue-test-core": minor
---

feat: add plugin-aware validation and DX warnings for factory configuration objects

TestForge now detects managed plugin options placed at the root level of:

- `defaultMountOptions`
- `mountOptions`
- `extraOptions`

and suggests moving them under `plugins.<pluginName>`.

Plugin validation is preset-aware and includes improved warning messages with configuration context.
