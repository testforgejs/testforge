---
"@testforgejs/vue-test-plugin-vuetify": minor
"@testforgejs/vue-test-plugin-router": minor
"@testforgejs/vue-test-plugin-pinia": minor
"@testforgejs/vue-test-plugin-i18n": minor
"@testforgejs/vue-test-core": minor
---

Add support for managed plugin instance dependencies.

- Introduce `fromPluginInstance()` for referencing runtime instances of managed plugins.
- Resolve nested instance references in dependency order, independently of manifest order.
- Detect invalid and circular plugin dependencies.
- Preserve instance isolation across component mounts.
- Register runtime instance types for supported plugins, enabling type-safe dependency resolution.
