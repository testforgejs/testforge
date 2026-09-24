---
"@testforgejs/vue-test-plugin-primevue-v3": minor
"@testforgejs/vue-test-plugin-primevue": minor
"@testforgejs/vue-test-plugin-vuetify": minor
"@testforgejs/vue-test-plugin-router": minor
"@testforgejs/vue-test-plugin-pinia": minor
"@testforgejs/vue-test-plugin-i18n": minor
---

Standardize the public package contract across TestForge plugins.

Each plugin package now exports its plugin module as `plugin` and its
plugin identifier as `PLUGIN_NAME`, providing consistent entry points
for consumers and tooling.

Existing plugin-specific exports, such as `piniaPlugin`, `routerPlugin`,
and `i18nPlugin`, remain available.
