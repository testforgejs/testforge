[**@testforgejs/vue-test-core**](../README.md)

***

> **validatePreset**(`name`, `preset`): `asserts preset is PresetDefinition`

Defined in: [packages/vue-test-core/src/presets/validators/validatePreset.ts:25](https://github.com/testforgejs/testforge/blob/445a1dda5af6e9fa30f2b4c58bbec4097a4a4e7a/packages/vue-test-core/src/presets/validators/validatePreset.ts#L25)

Validates a preset definition and narrows its type on success.

Ensures that:
- the preset is a plain object;
- `manifest` is an array with unique plugin names;
- each manifest entry has a plugin module exposing `getName()`
  and `getDefinition()` methods, and a boolean `enabled` flag;
- `defaults` is a plain object;
- each defaults key corresponds to a plugin declared in the manifest;
- each default configuration is provided as an options factory function.

Default-options factories are not invoked or their returned values validated.

## Parameters

### name

`string`

The preset name used to identify validation errors.

### preset

`unknown`

The value to validate as a preset definition.

## Returns

`asserts preset is PresetDefinition`

## Throws

If the preset violates the validation rules.
