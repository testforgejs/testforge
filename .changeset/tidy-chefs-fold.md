---
"@testforgejs/vue-test-plugin-primevue-v3": minor
"@testforgejs/vue-test-plugin-primevue": minor
"@testforgejs/vue-test-plugin-vuetify": minor
"@testforgejs/vue-test-plugin-router": minor
"@testforgejs/vue-test-plugin-pinia": minor
"@testforgejs/vue-test-plugin-i18n": minor
---

Standardize the `PluginOptions` type export across all plugin packages.

- Expose public plugin configuration types under the consistent `PluginOptions` name.
- Preserve existing descriptive type exports for backward compatibility.
- Enable type-safe preset generation without plugin-specific knowledge of configuration type names.
- Support the same package-level contract for factory-based and install-based plugins.
