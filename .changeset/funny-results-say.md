---
"@testforgejs/vue-test-core": minor
"@testforgejs/vue-test-plugin-vuetify": patch
"@testforgejs/vue-test-plugin-router": patch
"@testforgejs/vue-test-plugin-pinia": patch
"@testforgejs/vue-test-plugin-i18n": patch
---

Add runtime capability metadata for plugin instance references.

`PluginDefinition` now supports the optional `supportsInstanceReferences` flag, allowing TestForge to distinguish plugins that expose addressable runtime instances from install-based plugins.

Instance-based I18n, Pinia, Router, and Vuetify integrations now declare this capability.
