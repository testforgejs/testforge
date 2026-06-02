---
"@testforge/vue-test-core": major
---

feat: removed support for `false` values in preset plugin defaults.

Preset `defaults` entries must now always contain configuration objects. Plugin disabling should be handled through the preset manifest or runtime plugin options instead.

This change simplifies the plugin configuration model and aligns runtime validation with the `PluginConfig` architecture.
