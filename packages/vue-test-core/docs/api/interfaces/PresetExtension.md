[**@testforgejs/vue-test-core**](../README.md)

***

Defined in: [packages/vue-test-core/src/types.ts:696](https://github.com/testforgejs/testforge/blob/445a1dda5af6e9fa30f2b4c58bbec4097a4a4e7a/packages/vue-test-core/src/types.ts#L696)

Defines changes applied when extending an existing preset.

Used by `extendPreset()` to create a new preset from a base definition.
An extension can add or update manifest entries and replace
default-options factories for individual plugins.

Both properties are optional. Omitted properties preserve
the corresponding configuration from the base preset.

## Properties

### defaults?

> `optional` **defaults?**: `PluginConfigDefaults`

Defined in: [packages/vue-test-core/src/types.ts:712](https://github.com/testforgejs/testforge/blob/445a1dda5af6e9fa30f2b4c58bbec4097a4a4e7a/packages/vue-test-core/src/types.ts#L712)

Default-options factories to add or replace by plugin name.

Each key must correspond to a plugin in the resulting manifest.
An existing factory is replaced entirely; its returned options
are not automatically merged with the replacement.

***

### manifest?

> `optional` **manifest?**: [`PluginManifestEntry`](PluginManifestEntry.md)\<`any`, `any`\>[]

Defined in: [packages/vue-test-core/src/types.ts:703](https://github.com/testforgejs/testforge/blob/445a1dda5af6e9fa30f2b4c58bbec4097a4a4e7a/packages/vue-test-core/src/types.ts#L703)

Plugin manifest entries to add or update by plugin name.

Existing entries retain their modules and may have their enabled
state changed. Entries for new plugins are added to the manifest.
