---
"@testforge/vue-test-plugin-vuetify": minor
---

feat: add initial Vuetify plugin implementation for TestForge

Features included in the initial release:

- automatic integration with `createVuetify()`
- support for `VuetifyOptions`
- `PluginControlOptions` support including `expose()`
- module augmentation for `PluginOptionsMap`
- full compatibility with the TestForge plugin pipeline

The plugin currently targets Vuetify 3 and is expected to remain compatible with future Vuetify 4 releases that continue to expose the `createVuetify()` factory API.
