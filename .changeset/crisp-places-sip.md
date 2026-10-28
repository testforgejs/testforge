---
"@testforgejs/vue-test-plugin-vuetify": minor
"@testforgejs/vue-test-plugin-router": minor
"@testforgejs/vue-test-plugin-pinia": minor
"@testforgejs/vue-test-plugin-i18n": minor
"@testforgejs/vue-test-core": minor
---

Refine managed plugin instance typing and capabilities.

- Use `PluginInstanceMap` as the source of truth for managed instance support.
- Restrict `captureInstance()` and `withPluginInstance()` to plugins registered in `PluginInstanceMap`.
- Preserve type-safe instance capturing and reuse through registered instance types.
- Explicitly reject instance controls for install-based plugins without managed instances.
- Separate public plugin configuration types from internal runtime instance controls.
- Introduce dedicated runtime options for Pinia, Router, I18n, and Vuetify.
- Expand type tests covering supported, unsupported, and incompatible plugin instances.

- **BREAKING (TypeScript):** Remove the `PluginControlOptions`
  export. Managed instance controls are now provided automatically
  for plugins registered in `PluginInstanceMap`.
