---
"@testforgejs/vue-test-core": minor
---

feat: added support for install-based Vue plugins through the new `createVuePlugin()` helper

This allows TestForge plugins to integrate Vue plugins implemented as:

- install objects (`{ install(app) {} }`)
- install functions (`(app) => {}`)

Examples include PrimeVue and similar libraries that do not expose stateful runtime instances.

Unlike `createPluginInstance()`, install-based plugins do not support `__meta.instance` reuse or `expose()` callbacks because they do not produce runtime instances.
