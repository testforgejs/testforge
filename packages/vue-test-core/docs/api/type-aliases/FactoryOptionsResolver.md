[**@testforgejs/vue-test-core**](../README.md)

***

> **FactoryOptionsResolver**\<`T`, `Resolved`\> = () => `Resolved` & `object` & `StrictFactoryCreationOptions`\<`T`, `Resolved`\>

Defined in: [packages/vue-test-core/src/types.ts:932](https://github.com/testforgejs/testforge/blob/445a1dda5af6e9fa30f2b4c58bbec4097a4a4e7a/packages/vue-test-core/src/types.ts#L932)

Resolves component factory configuration for each mount.

The resolver is invoked once per mount and returns the component,
its default configuration, and optional factory-level settings.

Mutable default values should be recreated for each invocation
to prevent shared state between component mounts.

The inferred configuration shape is preserved to enable additional
type checking of TestForge-owned configuration keys.

## Type Parameters

### T

`T` *extends* `Component`

The Vue component type used to validate component-specific
props, slots, and mounting options.

### Resolved

`Resolved` *extends* [`ComponentFactoryCreationOptions`](../interfaces/ComponentFactoryCreationOptions.md)\<`T`\> = [`ComponentFactoryCreationOptions`](../interfaces/ComponentFactoryCreationOptions.md)\<`T`\>

The inferred configuration shape returned by the
resolver, used to detect unexpected keys in TestForge-owned options.

## Returns

`Resolved` & `object` & `StrictFactoryCreationOptions`\<`T`, `Resolved`\>
