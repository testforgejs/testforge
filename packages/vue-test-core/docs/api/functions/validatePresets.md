[**@testforgejs/vue-test-core**](../README.md)

***

> **validatePresets**(`presets`): `asserts presets is TestFrameworkPresets`

Defined in: [packages/vue-test-core/src/presets/validators/validatePresets.ts:20](https://github.com/testforgejs/testforge/blob/445a1dda5af6e9fa30f2b4c58bbec4097a4a4e7a/packages/vue-test-core/src/presets/validators/validatePresets.ts#L20)

Validates a registry of named presets and narrows its type on success.

Ensures that the registry is a plain object and that every registered
preset satisfies the validation rules enforced by `validatePreset()`.

An empty registry is allowed.

## Parameters

### presets

`unknown`

The value to validate as a registry of named presets.

## Returns

`asserts presets is TestFrameworkPresets`

## Throws

If the registry is not a plain object or any registered
preset fails validation.
