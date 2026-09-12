---
"@testforgejs/vue-test-core": minor
---

Add mutually exclusive `preset` and `presets` options to `createTestFramework()`.

Presets can now be provided either as a single runtime environment or as a named preset registry. When using a preset registry, `extraOptions.preset` selects the runtime environment for a factory invocation.

Expose the public `CreateTestFrameworkOptions`, `PresetExtension`, and `PluginManifestEntry` types for preset configuration and composition.
