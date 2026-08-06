---
"@testforgejs/vue-test-core": minor
---

feat: improved plugin typing by introducing the `MountPlugin` abstraction

`PluginDefinition`, `PluginModule`, and `PluginManifestEntry` now constrain plugin instances to Vue Test Utils compatible plugin entries, including both plain Vue plugins and tuple-style plugin registrations (`[plugin, options]`).

This change improves type safety for future plugin integrations such as Vuetify and other installable Vue plugins.
