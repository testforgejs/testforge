[**@testforgejs/vue-test-core**](../README.md)

***

Defined in: [packages/vue-test-core/src/types.ts:643](https://github.com/testforgejs/testforge/blob/445a1dda5af6e9fa30f2b4c58bbec4097a4a4e7a/packages/vue-test-core/src/types.ts#L643)

Defines a preset of TestForge-managed plugins and their default configuration.

The manifest declares which plugins are available and whether they are
enabled by default. The `defaults` map provides optional per-plugin
configuration factories.

Default configuration keys must correspond to plugin names declared
in the manifest.

## Properties

### defaults

> **defaults**: `PluginConfigDefaults`

Defined in: [packages/vue-test-core/src/types.ts:660](https://github.com/testforgejs/testforge/blob/445a1dda5af6e9fa30f2b4c58bbec4097a4a4e7a/packages/vue-test-core/src/types.ts#L660)

Default configuration factories keyed by plugin name.

Each key must match the name of a plugin declared in `manifest`.
Individual manifest plugins may omit default configuration.

This property is required but may be an empty object.

***

### manifest

> **manifest**: [`PluginManifestEntry`](PluginManifestEntry.md)\<`any`, `any`\>[]

Defined in: [packages/vue-test-core/src/types.ts:650](https://github.com/testforgejs/testforge/blob/445a1dda5af6e9fa30f2b4c58bbec4097a4a4e7a/packages/vue-test-core/src/types.ts#L650)

Plugins available in this preset and their initial enabled state.

Each entry associates a plugin module with its enabled flag.
Plugin names within the manifest must be unique.
