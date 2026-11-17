[**@testforgejs/vue-test-core**](../README.md)

***

> **extendPreset**(`basePreset`, `extension`): [`PresetDefinition`](../interfaces/PresetDefinition.md)

Defined in: [packages/vue-test-core/src/presets/extendPreset.ts:53](https://github.com/testforgejs/testforge/blob/445a1dda5af6e9fa30f2b4c58bbec4097a4a4e7a/packages/vue-test-core/src/presets/extendPreset.ts#L53)

Creates a new preset by extending an existing preset definition.

Combines the base preset with additional manifest entries and
default-options factories without mutating the base preset.

Existing manifest entries retain their plugin modules and may have
their enabled state updated. New plugins are added to the manifest
and must provide a corresponding default-options factory.

Default-options factories supplied by the extension replace existing
factories by plugin name. Their returned options are not automatically
merged with the base configuration.

Preset defaults must be factory functions; values such as `false`
are not allowed. Use the manifest's `enabled` flag or runtime
plugin configuration to control plugin activation.

Preset extension is a composition operation, not a runtime
configuration overlay.

## Parameters

### basePreset

[`PresetDefinition`](../interfaces/PresetDefinition.md)

The preset definition to extend.

### extension

[`PresetExtension`](../interfaces/PresetExtension.md)

Manifest changes and default-options factories
to apply to the base preset.

## Returns

[`PresetDefinition`](../interfaces/PresetDefinition.md)

A new preset definition with the combined manifest and
default-options factories.

## Throws

If the base preset or extension is missing, the extension
contains duplicate plugin names, a new plugin lacks required settings,
or plugin defaults are invalid or reference undeclared plugins.

## Example

```typescript
import { extendPreset } from "@testforgejs/vue-test-core";
import { presets as recommendedPresets } from "@testforgejs/vue-test-preset-recommended";
import { PLUGIN_NAME as I18N_PLUGIN_NAME } from "@testforgejs/vue-test-plugin-i18n";

const projectPreset = extendPreset(recommendedPresets.default, {
  defaults: {
    [I18N_PLUGIN_NAME]: () => ({
      legacy: false,
      globalInjection: true,
      locale: "uk",
    }),
  },
});
```
